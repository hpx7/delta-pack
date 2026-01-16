use crate::rle::RleReader;
use crate::varint::{read_uvarint, read_varint};

/// Dictionary entry - either a buffer position or an owned string (for diff entries).
enum DictEntry {
    Pos(usize, usize),
    Owned(String),
}

/// Binary decoder with string dictionary and RLE bit unpacking.
pub struct Decoder<'a> {
    buffer: &'a [u8],
    pos: usize,
    dict: Vec<DictEntry>,
    rle: RleReader<'a>,
}

impl<'a> Decoder<'a> {
    pub fn new(buf: &'a [u8]) -> Self {
        Self {
            buffer: buf,
            pos: 0,
            dict: Vec::new(),
            rle: RleReader::new(buf),
        }
    }

    /// Decode using a thread-local decoder for optimal performance.
    /// This avoids allocation overhead by reusing the dictionary Vec across calls.
    #[inline]
    pub fn decode<F, R>(buf: &[u8], f: F) -> R
    where
        F: FnOnce(&mut Decoder) -> R,
    {
        use std::cell::RefCell;
        thread_local! {
            static DICT: RefCell<Vec<DictEntry>> = RefCell::new(Vec::new());
        }
        DICT.with(|dict| {
            let mut dict = dict.borrow_mut();
            dict.clear();
            let mut dec = Decoder { buffer: buf, pos: 0, dict: std::mem::take(&mut *dict), rle: RleReader::new(buf) };
            let result = f(&mut dec);
            *dict = dec.dict;
            result
        })
    }

    // Primitive methods

    #[inline]
    pub fn next_string(&mut self) -> String {
        let (len_or_idx, bytes_read) = read_varint(self.buffer, self.pos);
        self.pos += bytes_read;

        if len_or_idx == 0 {
            return String::new();
        }

        if len_or_idx > 0 {
            let len = len_or_idx as usize;
            let start = self.pos;
            self.pos += len;
            self.dict.push(DictEntry::Pos(start, len));
            return unsafe {
                String::from(std::str::from_utf8_unchecked(&self.buffer[start..start + len]))
            };
        }

        // Negative = dictionary index
        match &self.dict[(-len_or_idx - 1) as usize] {
            DictEntry::Pos(start, len) => unsafe {
                String::from(std::str::from_utf8_unchecked(&self.buffer[*start..*start + *len]))
            },
            DictEntry::Owned(s) => s.clone(),
        }
    }

    #[inline]
    pub fn next_int(&mut self) -> i64 {
        let (val, bytes_read) = read_varint(self.buffer, self.pos);
        self.pos += bytes_read;
        val
    }

    #[inline]
    pub fn next_uint(&mut self) -> u64 {
        let (val, bytes_read) = read_uvarint(self.buffer, self.pos);
        self.pos += bytes_read;
        val
    }

    #[inline]
    pub fn next_bounded_int(&mut self, min: i64) -> i64 {
        self.next_uint() as i64 + min
    }

    #[inline]
    pub fn next_float(&mut self) -> f32 {
        let bytes: [u8; 4] = self.buffer[self.pos..self.pos + 4]
            .try_into()
            .unwrap();
        self.pos += 4;
        f32::from_le_bytes(bytes)
    }

    #[inline]
    pub fn next_float_quantized(&mut self, precision: f32) -> f32 {
        self.next_int() as f32 * precision
    }

    #[inline]
    pub fn next_boolean(&mut self) -> bool {
        self.rle.next_bit()
    }

    #[inline]
    pub fn next_enum(&mut self, num_bits: u8) -> u32 {
        self.rle.next_bits(num_bits)
    }

    // Diff methods (value-only - caller handles change bit for object fields)

    #[inline]
    pub fn next_string_diff(&mut self, a: &str) -> String {
        // Only add to dictionary if not already present (for decoder sync)
        let already_in_dict = self.dict.iter().any(|entry| match entry {
            DictEntry::Pos(start, len) => unsafe {
                std::str::from_utf8_unchecked(&self.buffer[*start..*start + *len]) == a
            },
            DictEntry::Owned(s) => s == a,
        });
        if !already_in_dict {
            self.dict.push(DictEntry::Owned(a.to_string()));
        }
        self.next_string()
    }

    #[inline]
    pub fn next_int_diff(&mut self, _a: i64) -> i64 {
        self.next_int()
    }

    #[inline]
    pub fn next_uint_diff(&mut self, _a: u64) -> u64 {
        self.next_uint()
    }

    #[inline]
    pub fn next_bounded_int_diff(&mut self, _a: i64, min: i64) -> i64 {
        self.next_bounded_int(min)
    }

    #[inline]
    pub fn next_float_diff(&mut self, _a: f32) -> f32 {
        self.next_float()
    }

    #[inline]
    pub fn next_float_quantized_diff(&mut self, _a: f32, precision: f32) -> f32 {
        self.next_float_quantized(precision)
    }

    #[inline]
    pub fn next_boolean_diff(&mut self, a: bool) -> bool {
        // Boolean diff is special - change bit IS the diff
        a ^ self.next_boolean()
    }

    #[inline]
    pub fn next_enum_diff(&mut self, _a: u32, num_bits: u8) -> u32 {
        self.next_enum(num_bits)
    }

    // Array helpers

    /// Decode an array by reading length followed by each element.
    #[inline]
    pub fn next_array<T, F>(&mut self, mut inner_read: F) -> Vec<T>
    where
        F: FnMut(&mut Self) -> T,
    {
        let len = self.next_uint() as usize;
        let mut arr = Vec::with_capacity(len);
        for _ in 0..len {
            arr.push(inner_read(self));
        }
        arr
    }

    /// Decode array diff, using sparse format with index-based updates.
    /// Caller handles change bit.
    #[inline]
    pub fn next_array_diff<T, F, FD>(&mut self, a: &[T], mut inner_read: F, mut inner_diff: FD) -> Vec<T>
    where
        T: Clone,
        F: FnMut(&mut Self) -> T,
        FD: FnMut(&mut Self, &T) -> T,
    {
        let new_len = self.next_uint() as usize;

        // Start with copy of old array (truncated to new length)
        let mut arr: Vec<T> = a.iter().take(new_len.min(a.len())).cloned().collect();

        // Apply updates (sparse)
        let num_updates = self.next_uint() as usize;
        for _ in 0..num_updates {
            let idx = self.next_uint() as usize;
            arr[idx] = inner_diff(self, &a[idx]);
        }

        // Read additions
        for _ in a.len()..new_len {
            arr.push(inner_read(self));
        }

        arr
    }

    // Optional helpers

    #[inline]
    pub fn next_optional<T, F>(&mut self, mut inner_read: F) -> Option<T>
    where
        F: FnMut(&mut Self) -> T,
    {
        self.next_boolean().then(|| inner_read(self))
    }

    /// Decode optional diff, matching TS/C# format.
    /// Optimization: if a was None, we know b must be Some (else unchanged).
    /// So no present bit in None→Some case.
    #[inline]
    pub fn next_optional_diff<T, F, FD>(&mut self, a: &Option<T>, mut inner_read: F, mut inner_diff: FD) -> Option<T>
    where
        T: Clone,
        F: FnMut(&mut Self) -> T,
        FD: FnMut(&mut Self, &T) -> T,
    {
        match a {
            None => {
                // None → Some (guaranteed Some by caller)
                Some(inner_read(self))
            }
            Some(av) => {
                if self.next_boolean() {
                    Some(inner_diff(self, av)) // Some → Some
                } else {
                    None // Some → None
                }
            }
        }
    }

    // Record (map) helpers

    /// Decode a record (map) by reading length followed by key-value pairs.
    #[inline]
    pub fn next_record<K, V, FK, FV>(&mut self, mut key_read: FK, mut val_read: FV) -> std::collections::HashMap<K, V>
    where
        K: Eq + std::hash::Hash,
        FK: FnMut(&mut Self) -> K,
        FV: FnMut(&mut Self) -> V,
    {
        let len = self.next_uint() as usize;
        let mut map = std::collections::HashMap::with_capacity(len);
        for _ in 0..len {
            let k = key_read(self);
            let v = val_read(self);
            map.insert(k, v);
        }
        map
    }

    /// Decode record diff, matching TS/C# format.
    /// Caller handles change bit.
    /// Format: if a.len > 0: deletions, updates; then additions
    #[inline]
    pub fn next_record_diff<K, V, FK, FV, FVD>(
        &mut self,
        a: &std::collections::HashMap<K, V>,
        mut key_read: FK,
        mut val_read: FV,
        mut val_diff: FVD,
    ) -> std::collections::HashMap<K, V>
    where
        K: Clone + Eq + std::hash::Hash,
        V: Clone,
        FK: FnMut(&mut Self) -> K,
        FV: FnMut(&mut Self) -> V,
        FVD: FnMut(&mut Self, &V) -> V,
    {
        let mut result = a.clone();

        // Read deletions and updates (only if a was non-empty)
        if !a.is_empty() {
            let num_deletions = self.next_uint() as usize;
            for _ in 0..num_deletions {
                let key = key_read(self);
                result.remove(&key);
            }
            let num_updates = self.next_uint() as usize;
            for _ in 0..num_updates {
                let key = key_read(self);
                let new_val = val_diff(self, result.get(&key).unwrap());
                result.insert(key, new_val);
            }
        }

        // Read additions
        let num_additions = self.next_uint() as usize;
        for _ in 0..num_additions {
            let k = key_read(self);
            let v = val_read(self);
            result.insert(k, v);
        }

        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Encoder;

    #[test]
    fn test_encode_decode_string() {
        let mut encoder = Encoder::new();
        encoder.push_string("hello");
        encoder.push_string("world");
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        assert_eq!(decoder.next_string(), "hello");
        assert_eq!(decoder.next_string(), "world");
    }

    #[test]
    fn test_encode_decode_string_dictionary() {
        let mut encoder = Encoder::new();
        encoder.push_string("hello");
        encoder.push_string("hello"); // Uses dictionary
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        assert_eq!(decoder.next_string(), "hello");
        assert_eq!(decoder.next_string(), "hello");
    }

    #[test]
    fn test_encode_decode_int() {
        let mut encoder = Encoder::new();
        encoder.push_int(42);
        encoder.push_int(-100);
        encoder.push_int(0);
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        assert_eq!(decoder.next_int(), 42);
        assert_eq!(decoder.next_int(), -100);
        assert_eq!(decoder.next_int(), 0);
    }

    #[test]
    fn test_encode_decode_uint() {
        let mut encoder = Encoder::new();
        encoder.push_uint(0);
        encoder.push_uint(127);
        encoder.push_uint(128);
        encoder.push_uint(16383);
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        assert_eq!(decoder.next_uint(), 0);
        assert_eq!(decoder.next_uint(), 127);
        assert_eq!(decoder.next_uint(), 128);
        assert_eq!(decoder.next_uint(), 16383);
    }

    #[test]
    fn test_encode_decode_float() {
        let mut encoder = Encoder::new();
        encoder.push_float(3.14);
        encoder.push_float(-2.5);
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        assert!((decoder.next_float() - 3.14).abs() < 0.001);
        assert!((decoder.next_float() - (-2.5)).abs() < 0.001);
    }

    #[test]
    fn test_encode_decode_float_quantized() {
        let mut encoder = Encoder::new();
        encoder.push_float_quantized(3.14159, 0.01);
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        let val = decoder.next_float_quantized(0.01);
        assert!((val - 3.14).abs() < 0.01);
    }

    #[test]
    fn test_encode_decode_boolean() {
        let mut encoder = Encoder::new();
        encoder.push_boolean(true);
        encoder.push_boolean(false);
        encoder.push_boolean(true);
        encoder.push_boolean(true);
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        assert!(decoder.next_boolean());
        assert!(!decoder.next_boolean());
        assert!(decoder.next_boolean());
        assert!(decoder.next_boolean());
    }

    #[test]
    fn test_encode_decode_mixed() {
        let mut encoder = Encoder::new();
        encoder.push_string("test");
        encoder.push_int(42);
        encoder.push_boolean(true);
        encoder.push_float(3.14);
        encoder.push_boolean(false);
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        assert_eq!(decoder.next_string(), "test");
        assert_eq!(decoder.next_int(), 42);
        assert!(decoder.next_boolean());
        assert!((decoder.next_float() - 3.14).abs() < 0.001);
        assert!(!decoder.next_boolean());
    }

    #[test]
    fn test_diff_string() {
        let mut encoder = Encoder::new();
        encoder.push_string_diff("hello", "hello"); // unchanged
        encoder.push_string_diff("hello", "world"); // changed
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        assert_eq!(decoder.next_string_diff("hello"), "hello");
        assert_eq!(decoder.next_string_diff("hello"), "world");
    }

    #[test]
    fn test_diff_int() {
        let mut encoder = Encoder::new();
        encoder.push_int_diff(10, 10); // unchanged
        encoder.push_int_diff(10, 20); // changed
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        assert_eq!(decoder.next_int_diff(10), 10);
        assert_eq!(decoder.next_int_diff(10), 20);
    }

    #[test]
    fn test_array_encode_decode() {
        let mut encoder = Encoder::new();
        let arr = vec![1i64, 2, 3, 4, 5];
        encoder.push_array(&arr, |enc, &x| enc.push_int(x));
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        let result: Vec<i64> = decoder.next_array(|dec| dec.next_int());
        assert_eq!(result, arr);
    }

    #[test]
    fn test_array_diff() {
        let a = vec![1i64, 2, 3];
        let b = vec![1i64, 5, 3, 4]; // changed element and added element

        let mut encoder = Encoder::new();
        encoder.push_array_diff(
            &a,
            &b,
            |x, y| x == y,
            |enc: &mut Encoder, &x| enc.push_int(x),
            |enc: &mut Encoder, _, &x| enc.push_int(x), // diff takes (a, b)
        );
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        let result: Vec<i64> = decoder.next_array_diff(
            &a,
            |dec| dec.next_int(),
            |dec, _| dec.next_int(), // diff returns new value
        );
        assert_eq!(result, b);
    }

    #[test]
    fn test_optional_encode_decode() {
        let mut encoder = Encoder::new();
        encoder.push_optional(&Some(42i64), |enc, &x| enc.push_int(x));
        encoder.push_optional(&None::<i64>, |enc, &x| enc.push_int(x));
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        assert_eq!(decoder.next_optional(|dec| dec.next_int()), Some(42));
        assert_eq!(decoder.next_optional(|dec| dec.next_int()), None);
    }

    #[test]
    fn test_optional_diff() {
        // None to Some
        let mut encoder = Encoder::new();
        encoder.push_optional_diff(
            &None::<i64>,
            &Some(42i64),
            |enc: &mut Encoder, &x| enc.push_int(x),
            |enc: &mut Encoder, _, &x| enc.push_int(x), // diff takes (a, b)
        );
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        let result = decoder.next_optional_diff(
            &None,
            |dec| dec.next_int(),
            |dec, _| dec.next_int(),
        );
        assert_eq!(result, Some(42));
    }

    #[test]
    fn test_record_encode_decode() {
        let mut encoder = Encoder::new();
        let mut map = std::collections::HashMap::new();
        map.insert("a".to_string(), 1i64);
        map.insert("b".to_string(), 2i64);
        encoder.push_record(
            &map,
            |enc, k| enc.push_string(k),
            |enc, &v| enc.push_int(v),
        );
        let buf = encoder.finish();

        let mut decoder = Decoder::new(&buf);
        let result: std::collections::HashMap<String, i64> = decoder.next_record(
            |dec| dec.next_string(),
            |dec| dec.next_int(),
        );
        assert_eq!(result, map);
    }
}
