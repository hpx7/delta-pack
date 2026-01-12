use crate::helpers::{equals_array, equals_float, equals_float_quantized, equals_record};
use crate::rle::RleWriter;
use crate::varint::{write_uvarint_vec, write_varint_vec};

/// Fast string hash (FxHash algorithm).
#[inline]
fn hash_str(s: &str) -> u64 {
    const K: u64 = 0x517cc1b727220a95;
    let bytes = s.as_bytes();
    let mut hash: u64 = 0;
    for chunk in bytes.chunks(8) {
        let mut val = 0u64;
        for (i, &b) in chunk.iter().enumerate() {
            val |= (b as u64) << (i * 8);
        }
        hash = (hash.rotate_left(5) ^ val).wrapping_mul(K);
    }
    hash
}

/// Binary encoder with RLE bit packing.
pub struct Encoder {
    buffer: Vec<u8>,
    dict: Vec<u64>,
    rle: RleWriter,
}

impl Encoder {
    /// Create a new encoder.
    #[inline]
    pub fn new() -> Self {
        Self {
            buffer: Vec::with_capacity(32),
            dict: Vec::new(),
            rle: RleWriter::new(),
        }
    }

    /// Encode using a thread-local encoder for optimal performance.
    /// This avoids allocation overhead by reusing the encoder across calls.
    #[inline]
    pub fn encode<F, R>(f: F) -> R
    where
        F: FnOnce(&mut Encoder) -> R,
    {
        use std::cell::RefCell;
        thread_local! {
            static ENCODER: RefCell<Encoder> = RefCell::new(Encoder::new());
        }
        ENCODER.with(|enc| f(&mut enc.borrow_mut()))
    }

    // Primitive methods

    /// Push a string value with dictionary deduplication.
    #[inline]
    pub fn push_string(&mut self, val: &str) {
        if val.is_empty() {
            self.push_int(0);
            return;
        }

        // Check dictionary for deduplication
        let hash = hash_str(val);
        if let Some(idx) = self.dict.iter().position(|&h| h == hash) {
            self.push_int(-(idx as i64) - 1);
            return;
        }

        self.dict.push(hash);
        let bytes = val.as_bytes();
        self.push_int(bytes.len() as i64);
        self.buffer.extend_from_slice(bytes);
    }

    #[inline]
    pub fn push_int(&mut self, val: i64) {
        write_varint_vec(&mut self.buffer, val);
    }

    #[inline]
    pub fn push_bounded_int(&mut self, val: i64, min: i64) {
        self.push_uint((val - min) as u64);
    }

    #[inline]
    pub fn push_uint(&mut self, val: u64) {
        write_uvarint_vec(&mut self.buffer, val);
    }

    #[inline]
    pub fn push_float(&mut self, val: f32) {
        self.buffer.extend_from_slice(&val.to_le_bytes());
    }

    #[inline]
    pub fn push_float_quantized(&mut self, val: f32, precision: f32) {
        self.push_int((val / precision).round() as i64);
    }

    #[inline]
    pub fn push_boolean(&mut self, val: bool) {
        self.rle.push_bit(val);
    }

    #[inline]
    pub fn push_enum(&mut self, val: u32, num_bits: u8) {
        self.rle.push_bits(val, num_bits);
    }

    // Diff methods

    #[inline]
    pub fn push_string_diff(&mut self, a: &str, b: &str) {
        // Ensure 'a' is in dictionary for future reference
        let hash_a = hash_str(a);
        if !self.dict.contains(&hash_a) {
            self.dict.push(hash_a);
        }
        self.push_boolean(a != b);
        if a != b {
            self.push_string(b);
        }
    }

    #[inline]
    pub fn push_int_diff(&mut self, a: i64, b: i64) {
        self.push_boolean(a != b);
        if a != b {
            self.push_int(b);
        }
    }

    #[inline]
    pub fn push_uint_diff(&mut self, a: u64, b: u64) {
        self.push_boolean(a != b);
        if a != b {
            self.push_uint(b);
        }
    }

    #[inline]
    pub fn push_bounded_int_diff(&mut self, a: i64, b: i64, min: i64) {
        let a_offset = a - min;
        let b_offset = b - min;
        self.push_boolean(a_offset != b_offset);
        if a_offset != b_offset {
            self.push_uint(b_offset as u64);
        }
    }

    #[inline]
    pub fn push_float_diff(&mut self, a: f32, b: f32) {
        let changed = !equals_float(a, b);
        self.push_boolean(changed);
        if changed {
            self.push_float(b);
        }
    }

    #[inline]
    pub fn push_float_quantized_diff(&mut self, a: f32, b: f32, precision: f32) {
        let changed = !equals_float_quantized(a, b, precision);
        self.push_boolean(changed);
        if changed {
            self.push_float_quantized(b, precision);
        }
    }

    #[inline]
    pub fn push_boolean_diff(&mut self, a: bool, b: bool) {
        self.push_boolean(a != b);
    }

    #[inline]
    pub fn push_enum_diff(&mut self, a: u32, b: u32, num_bits: u8) {
        self.push_boolean(a != b);
        if a != b {
            self.push_enum(b, num_bits);
        }
    }

    // Array helpers

    /// Encode an array by writing length followed by each element.
    #[inline]
    pub fn push_array<T, F>(&mut self, arr: &[T], mut inner_write: F)
    where
        F: FnMut(&mut Self, &T),
    {
        self.push_uint(arr.len() as u64);
        for item in arr {
            inner_write(self, item);
        }
    }

    /// Encode array diff by comparing lengths and elements.
    #[inline]
    pub fn push_array_diff<T, FW, FD, E>(
        &mut self,
        a: &[T],
        b: &[T],
        mut equals: E,
        mut inner_write: FW,
        mut inner_diff: FD,
    ) where
        FW: FnMut(&mut Self, &T),
        FD: FnMut(&mut Self, &T, &T),
        E: FnMut(&T, &T) -> bool,
    {
        let changed = !equals_array(a, b, &mut equals);
        self.push_boolean(changed);
        if !changed {
            return;
        }
        self.push_uint(b.len() as u64);
        let min_len = a.len().min(b.len());
        for i in 0..min_len {
            let elem_changed = !equals(&a[i], &b[i]);
            self.push_boolean(elem_changed);
            if elem_changed {
                inner_diff(self, &a[i], &b[i]);
            }
        }
        for i in min_len..b.len() {
            inner_write(self, &b[i]);
        }
    }

    // Optional helpers

    /// Encode an optional value by writing presence flag followed by value if present.
    #[inline]
    pub fn push_optional<T, F>(&mut self, opt: &Option<T>, mut inner_write: F)
    where
        F: FnMut(&mut Self, &T),
    {
        self.push_boolean(opt.is_some());
        if let Some(val) = opt {
            inner_write(self, val);
        }
    }

    /// Encode optional diff for non-primitives, matching TS/C# format.
    #[inline]
    pub fn push_optional_diff<T, FW, FD>(
        &mut self,
        a: &Option<T>,
        b: &Option<T>,
        mut inner_write: FW,
        mut inner_diff: FD,
    ) where
        FW: FnMut(&mut Self, &T),
        FD: FnMut(&mut Self, &T, &T),
    {
        self.push_boolean(b.is_some());
        match (a, b) {
            (_, None) => {} // Nothing more to write
            (None, Some(bv)) => inner_write(self, bv),
            (Some(av), Some(bv)) => inner_diff(self, av, bv),
        }
    }

    /// Encode optional diff for primitives/enums, matching TS/C# format.
    #[inline]
    pub fn push_optional_diff_primitive<T, E, W>(
        &mut self,
        a: &Option<T>,
        b: &Option<T>,
        mut equals: E,
        mut inner_write: W,
    ) where
        E: FnMut(&T, &T) -> bool,
        W: FnMut(&mut Self, &T),
    {
        match a {
            None => {
                self.push_boolean(b.is_some());
                if let Some(bv) = b {
                    inner_write(self, bv);
                }
            }
            Some(av) => {
                let changed = match b {
                    Some(bv) => !equals(av, bv),
                    None => true,
                };
                self.push_boolean(changed);
                if changed {
                    self.push_boolean(b.is_some());
                    if let Some(bv) = b {
                        inner_write(self, bv);
                    }
                }
            }
        }
    }

    // Record (map) helpers

    /// Encode a record (map) by writing length followed by key-value pairs.
    #[inline]
    pub fn push_record<K, V, FK, FV>(&mut self, map: &std::collections::HashMap<K, V>, mut key_write: FK, mut val_write: FV)
    where
        K: std::hash::Hash + Eq,
        FK: FnMut(&mut Self, &K),
        FV: FnMut(&mut Self, &V),
    {
        self.push_uint(map.len() as u64);
        for (k, v) in map {
            key_write(self, k);
            val_write(self, v);
        }
    }

    /// Encode record diff, matching TS/C# format.
    #[inline]
    pub fn push_record_diff<K, V, FK, FV, FVD, E>(
        &mut self,
        a: &std::collections::HashMap<K, V>,
        b: &std::collections::HashMap<K, V>,
        mut equals: E,
        mut key_write: FK,
        mut val_write: FV,
        mut val_diff: FVD,
    ) where
        K: Clone + std::hash::Hash + Eq,
        FK: FnMut(&mut Self, &K),
        FV: FnMut(&mut Self, &V),
        FVD: FnMut(&mut Self, &V, &V),
        E: FnMut(&V, &V) -> bool,
    {
        let changed = !equals_record(a, b, &mut equals);
        self.push_boolean(changed);
        if !changed {
            return;
        }

        let mut deletions = Vec::new();
        let mut updates = Vec::new();
        let mut additions = Vec::new();

        for (k, av) in a {
            if let Some(bv) = b.get(k) {
                if !equals(av, bv) {
                    updates.push(k.clone());
                }
            } else {
                deletions.push(k.clone());
            }
        }

        for (k, v) in b {
            if !a.contains_key(k) {
                additions.push((k.clone(), v));
            }
        }

        // Write deletions and updates (only if a was non-empty)
        if !a.is_empty() {
            self.push_uint(deletions.len() as u64);
            for key in &deletions {
                key_write(self, key);
            }
            self.push_uint(updates.len() as u64);
            for key in &updates {
                key_write(self, key);
                val_diff(self, a.get(key).unwrap(), b.get(key).unwrap());
            }
        }

        // Write additions
        self.push_uint(additions.len() as u64);
        for (k, v) in additions {
            key_write(self, &k);
            val_write(self, v);
        }
    }

    /// Finish encoding and return the buffer.
    #[inline]
    pub fn finish(&mut self) -> Vec<u8> {
        self.rle.write_to_buffer(&mut self.buffer);
        let result = std::mem::take(&mut self.buffer);
        self.buffer = Vec::with_capacity(64);
        self.dict.clear();
        self.rle.reset();
        result
    }
}

impl Default for Encoder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode_string() {
        let mut encoder = Encoder::new();
        encoder.push_string("hello");
        let buf = encoder.finish();
        assert!(!buf.is_empty());
    }

    #[test]
    fn test_encode_string_dictionary() {
        let mut encoder = Encoder::new();
        encoder.push_string("hello");
        encoder.push_string("world");
        encoder.push_string("hello"); // Should use dictionary
        let buf = encoder.finish();
        assert!(!buf.is_empty());
    }

    #[test]
    fn test_encode_int() {
        let mut encoder = Encoder::new();
        encoder.push_int(42);
        encoder.push_int(-100);
        let buf = encoder.finish();
        assert!(!buf.is_empty());
    }

    #[test]
    fn test_encode_float() {
        let mut encoder = Encoder::new();
        encoder.push_float(3.14);
        let buf = encoder.finish();
        assert_eq!(buf.len(), 4 + 1); // 4 bytes float + 1 byte RLE (0 bits)
    }

    #[test]
    fn test_encode_boolean() {
        let mut encoder = Encoder::new();
        encoder.push_boolean(true);
        encoder.push_boolean(false);
        encoder.push_boolean(true);
        let buf = encoder.finish();
        assert!(!buf.is_empty());
    }
}
