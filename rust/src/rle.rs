//! Streaming RLE (Run-Length Encoding) for bits.
//! Encodes sequences of same-valued bits efficiently.

/// Run lengths >= this use an escape sentinel followed by a varint instead of being
/// capped at the tier-5 fixed-width code (whose 8-bit payload could only reach 269).
const RUN_LENGTH_ESCAPE: u32 = 269;
const RUN_LENGTH_ESCAPE_SENTINEL: u32 = 255;
/// A u32 needs at most 5 groups of 7 bits; bounds the escape-varint and reverse-varint
/// read loops so a corrupted/adversarial stream can't force an unbounded scan.
const MAX_VARINT_BYTES: usize = 5;

/// Streaming RLE writer - encodes bits on-the-fly without buffering.
pub struct RleWriter {
    bytes: Vec<u8>,
    current_byte: u8,
    bit_pos: u8,
    total_bits: u32,
    run_value: i8, // -1 = no value, 0 = false, 1 = true
    run_count: u32,
}

impl RleWriter {
    pub fn new() -> Self {
        Self {
            bytes: Vec::new(),
            current_byte: 0,
            bit_pos: 0,
            total_bits: 0,
            run_value: -1,
            run_count: 0,
        }
    }

    pub fn reset(&mut self) {
        self.bytes.clear();
        self.current_byte = 0;
        self.bit_pos = 0;
        self.total_bits = 0;
        self.run_value = -1;
        self.run_count = 0;
    }

    #[inline]
    pub fn push_bit(&mut self, val: bool) {
        let val_i8 = val as i8;
        if self.run_value < 0 {
            self.run_value = val_i8;
            self.run_count = 1;
            self.write_bit(val as u8);
        } else if val_i8 == self.run_value {
            self.run_count += 1;
        } else {
            self.emit_run_length(self.run_count);
            self.run_value = val_i8;
            self.run_count = 1;
        }
    }

    pub fn push_bits(&mut self, val: u32, num_bits: u8) {
        for i in (0..num_bits).rev() {
            self.push_bit(((val >> i) & 1) == 1);
        }
    }

    pub fn write_to_buffer(&mut self, output: &mut Vec<u8>) {
        if self.run_value < 0 {
            // No bits written
            write_reverse_uvarint(output, 0);
            return;
        }

        self.emit_run_length(self.run_count);
        self.run_value = -1; // Mark as flushed

        // Flush remaining bits in current byte
        if self.bit_pos > 0 {
            self.bytes.push(self.current_byte);
        }

        // Copy RLE bytes to output
        output.extend_from_slice(&self.bytes);

        // Write reverse varint for total bits
        write_reverse_uvarint(output, self.total_bits);
    }

    fn write_bit(&mut self, bit: u8) {
        if bit == 1 {
            self.current_byte |= 1 << self.bit_pos;
        }

        self.bit_pos += 1;
        self.total_bits += 1;

        if self.bit_pos == 8 {
            self.bytes.push(self.current_byte);
            self.current_byte = 0;
            self.bit_pos = 0;
        }
    }

    fn write_bits(&mut self, val: u32, num_bits: u8) {
        for i in (0..num_bits).rev() {
            self.write_bit(((val >> i) & 1) as u8);
        }
    }

    fn emit_run_length(&mut self, count: u32) {
        if count == 1 {
            self.write_bit(0);
        } else if count <= 3 {
            self.write_bits(0b100 | (count - 2), 3);
        } else if count <= 5 {
            self.write_bits(0b1100 | (count - 4), 4);
        } else if count <= 13 {
            self.write_bits((0b1110 << 3) | (count - 6), 7);
        } else if count < RUN_LENGTH_ESCAPE {
            self.write_bits((0b1111 << 8) | (count - 14), 12);
        } else {
            self.write_bits((0b1111 << 8) | RUN_LENGTH_ESCAPE_SENTINEL, 12);
            self.write_uvarint_bits(count - RUN_LENGTH_ESCAPE);
        }
    }

    fn write_uvarint_bits(&mut self, mut val: u32) {
        while val >= 0x80 {
            self.write_bits((val & 0x7f) | 0x80, 8);
            val >>= 7;
        }
        self.write_bits(val, 8);
    }
}

impl Default for RleWriter {
    fn default() -> Self {
        Self::new()
    }
}

/// Write a reverse varint (MSB continuation bit, read from end of buffer).
fn write_reverse_uvarint(output: &mut Vec<u8>, val: u32) {
    if val < 0x80 {
        output.push(val as u8);
    } else {
        write_reverse_uvarint(output, val >> 7);
        output.push(((val & 0x7F) | 0x80) as u8);
    }
}

/// Streaming RLE reader - decodes bits lazily on-demand.
pub struct RleReader<'a> {
    buf: &'a [u8],
    byte_pos: usize,
    current_byte: u8,
    bit_pos: u8,
    value: bool,
    remaining: u32,
    initialized: bool,
    num_bits: u32,
    bits_read: u32,
}

impl<'a> RleReader<'a> {
    pub fn new(buf: &'a [u8]) -> Self {
        Self {
            buf,
            byte_pos: 0,
            current_byte: 0,
            bit_pos: 8,
            value: false,
            remaining: 0,
            initialized: false,
            num_bits: 0,
            bits_read: 0,
        }
    }

    #[inline]
    fn ensure_initialized(&mut self) {
        if self.initialized {
            return;
        }
        let (num_bits, varint_len) = read_reverse_uvarint(self.buf);
        if num_bits == 0 {
            panic!("No bits to read");
        }

        let num_rle_bytes = num_bits.div_ceil(8);
        if varint_len + num_rle_bytes as usize > self.buf.len() {
            panic!("RLE header declares a bit length larger than the buffer");
        }

        self.num_bits = num_bits;
        self.byte_pos = self.buf.len() - varint_len - num_rle_bytes as usize;
        self.value = self.read_bit() == 1;
        self.remaining = self.decode_run_length();
        self.initialized = true;
    }

    #[inline]
    pub fn next_bit(&mut self) -> bool {
        self.ensure_initialized();

        if self.remaining == 0 {
            self.value = !self.value;
            self.remaining = self.decode_run_length();
        }

        self.remaining -= 1;
        self.value
    }

    pub fn next_bits(&mut self, num_bits: u8) -> u32 {
        let mut val = 0u32;
        for i in (0..num_bits).rev() {
            if self.next_bit() {
                val |= 1 << i;
            }
        }
        val
    }

    #[inline]
    fn read_bit(&mut self) -> u8 {
        if self.bits_read >= self.num_bits {
            panic!("RLE stream overran its declared bit length");
        }
        self.bits_read += 1;

        if self.bit_pos == 8 {
            self.current_byte = self.buf[self.byte_pos];
            self.byte_pos += 1;
            self.bit_pos = 0;
        }
        let bit = (self.current_byte >> self.bit_pos) & 1;
        self.bit_pos += 1;
        bit
    }

    fn read_bits(&mut self, num_bits: u8) -> u32 {
        let mut val = 0u32;
        for i in (0..num_bits).rev() {
            if self.read_bit() == 1 {
                val |= 1 << i;
            }
        }
        val
    }

    #[inline]
    fn decode_run_length(&mut self) -> u32 {
        if self.read_bit() == 0 {
            return 1;
        }
        if self.read_bit() == 0 {
            return self.read_bits(1) + 2;
        }
        if self.read_bit() == 0 {
            return self.read_bits(1) + 4;
        }
        if self.read_bit() == 0 {
            return self.read_bits(3) + 6;
        }
        let payload = self.read_bits(8);
        if payload < RUN_LENGTH_ESCAPE_SENTINEL {
            return payload + 14;
        }

        // Widen to u64 so a maliciously long run of continuation groups can't silently
        // truncate here the way a u32 accumulator could; the final bounds check below is
        // what actually rejects a value too large for `remaining: u32` to hold.
        let extra = self.read_uvarint_bits();
        let total = extra + RUN_LENGTH_ESCAPE as u64;
        if total > u32::MAX as u64 {
            panic!("RLE escape run length overflows u32");
        }
        total as u32
    }

    fn read_uvarint_bits(&mut self) -> u64 {
        let mut result: u64 = 0;
        for group in 0..MAX_VARINT_BYTES {
            let b = self.read_bits(8);
            result |= ((b & 0x7f) as u64) << (group * 7);
            if b < 0x80 {
                return result;
            }
        }
        panic!("RLE escape varint too long");
    }
}

/// Read a reverse varint from the end of buffer.
/// Returns (value, bytes_read).
#[inline]
fn read_reverse_uvarint(buf: &[u8]) -> (u32, usize) {
    // Fast path for single-byte values (0-127) - most common case
    let b0 = buf[buf.len() - 1];
    if b0 < 0x80 {
        return (b0 as u32, 1);
    }

    let mut value = (b0 & 0x7F) as u32;
    for i in 1..MAX_VARINT_BYTES.min(buf.len()) {
        let b = buf[buf.len() - 1 - i];
        value |= ((b & 0x7F) as u32) << (i * 7);
        if b < 0x80 {
            return (value, i + 1);
        }
    }
    panic!("Invalid varint");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rle_single_bit() {
        let mut writer = RleWriter::new();
        writer.push_bit(true);

        let mut output = Vec::new();
        writer.write_to_buffer(&mut output);

        let mut reader = RleReader::new(&output);
        assert!(reader.next_bit());
    }

    #[test]
    fn test_rle_alternating_bits() {
        let mut writer = RleWriter::new();
        writer.push_bit(true);
        writer.push_bit(false);
        writer.push_bit(true);
        writer.push_bit(false);

        let mut output = Vec::new();
        writer.write_to_buffer(&mut output);

        let mut reader = RleReader::new(&output);
        assert!(reader.next_bit());
        assert!(!reader.next_bit());
        assert!(reader.next_bit());
        assert!(!reader.next_bit());
    }

    #[test]
    fn test_rle_run_of_same() {
        let mut writer = RleWriter::new();
        for _ in 0..10 {
            writer.push_bit(true);
        }

        let mut output = Vec::new();
        writer.write_to_buffer(&mut output);

        let mut reader = RleReader::new(&output);
        for _ in 0..10 {
            assert!(reader.next_bit());
        }
    }

    #[test]
    fn test_rle_multi_bits() {
        let mut writer = RleWriter::new();
        writer.push_bits(0b101, 3);
        writer.push_bits(0b1100, 4);

        let mut output = Vec::new();
        writer.write_to_buffer(&mut output);

        let mut reader = RleReader::new(&output);
        assert_eq!(reader.next_bits(3), 0b101);
        assert_eq!(reader.next_bits(4), 0b1100);
    }

    #[test]
    #[should_panic(expected = "No bits to read")]
    fn test_rle_empty() {
        let writer = RleWriter::new();
        let mut output = Vec::new();
        let mut w = writer;
        w.write_to_buffer(&mut output);

        let mut reader = RleReader::new(&output);
        reader.next_bit(); // Should panic
    }

    // -- Escape-sentinel boundary coverage --------------------------------------------

    fn encode_uniform_run(count: u32, value: bool) -> Vec<u8> {
        let mut writer = RleWriter::new();
        for _ in 0..count {
            writer.push_bit(value);
        }
        let mut output = Vec::new();
        writer.write_to_buffer(&mut output);
        output
    }

    fn decode_uniform_run(buf: &[u8], count: u32, expected: bool) {
        let mut reader = RleReader::new(buf);
        for _ in 0..count {
            assert_eq!(reader.next_bit(), expected);
        }
    }

    // Independent re-derivation of the writer's bit cost, to prove the escape fix
    // leaves the byte cost of counts 1-268 unchanged and that counts >= 269 cost
    // exactly "12 bits + one bit-level LEB128 varint".
    fn expected_run_length_bits(count: u32) -> u32 {
        if count == 1 {
            return 1;
        }
        if count <= 3 {
            return 3;
        }
        if count <= 5 {
            return 4;
        }
        if count <= 13 {
            return 7;
        }
        if count <= 268 {
            return 12;
        }
        let mut groups = 0u32;
        let mut v = count - 269;
        loop {
            groups += 1;
            v /= 128;
            if v == 0 {
                break;
            }
        }
        12 + groups * 8
    }

    fn expected_varint_length(mut val: u32) -> u32 {
        let mut len = 0u32;
        loop {
            len += 1;
            val /= 128;
            if val == 0 {
                break;
            }
        }
        len
    }

    fn expected_encoded_byte_length(count: u32) -> usize {
        let total_bits = 1 + expected_run_length_bits(count);
        let rle_bytes = total_bits.div_ceil(8);
        (rle_bytes + expected_varint_length(total_bits)) as usize
    }

    #[test]
    fn test_rle_run_of_270_round_trips() {
        // Before the escape-sentinel fix, count > 269 hit `panic!("RLE count too large")`.
        let output = encode_uniform_run(270, true);
        decode_uniform_run(&output, 270, true);
    }

    #[test]
    fn test_rle_boundary_run_lengths_round_trip() {
        for &count in &[
            268u32, 269, 270, 271, 300, 396, 397, 5000, 16652, 16653, 100_000, 1_000_000,
        ] {
            let output = encode_uniform_run(count, true);
            decode_uniform_run(&output, count, true);
        }
    }

    #[test]
    fn test_rle_byte_cost_unchanged_below_escape() {
        for count in 1..=268u32 {
            let output = encode_uniform_run(count, true);
            assert_eq!(
                output.len(),
                expected_encoded_byte_length(count),
                "byte cost mismatch at count {count}"
            );
            decode_uniform_run(&output, count, true);
        }
    }

    #[test]
    fn test_rle_escape_cost_matches_varint_formula() {
        for &count in &[269u32, 270, 300, 396, 397, 1000, 5000, 16652, 16653, 100_000] {
            let output = encode_uniform_run(count, false);
            assert_eq!(
                output.len(),
                expected_encoded_byte_length(count),
                "byte cost mismatch at count {count}"
            );
        }
    }

    #[test]
    fn test_rle_mixed_short_and_escape_tier_runs_round_trip() {
        let mut state: u64 = 7;
        let mut rand = |max: u32| -> u32 {
            state = state.wrapping_mul(6364136223846793005).wrapping_add(1);
            ((state >> 33) as u32) % max
        };

        let mut writer = RleWriter::new();
        let mut expected: Vec<bool> = Vec::new();
        let mut value = rand(2) == 1;
        for _ in 0..200 {
            let run_length = if rand(100) < 15 {
                500 + rand(19_500)
            } else {
                1 + rand(299)
            };
            for _ in 0..run_length {
                writer.push_bit(value);
                expected.push(value);
            }
            value = !value;
        }

        let mut output = Vec::new();
        writer.write_to_buffer(&mut output);

        let mut reader = RleReader::new(&output);
        for &bit in &expected {
            assert_eq!(reader.next_bit(), bit);
        }
    }

    // -- Malformed / adversarial input --------------------------------------------------
    // These hand-craft raw wire bytes directly (bypassing RleWriter) to simulate a
    // corrupted or hostile buffer reaching RleReader -- something RleWriter itself can
    // never produce, since it never emits values outside these encodings' valid ranges.

    fn push_byte_bits_msb_first(bits: &mut Vec<bool>, value: u8) {
        for i in (0..8).rev() {
            bits.push(((value >> i) & 1) == 1);
        }
    }

    // Bits are packed LSB-first within each byte, matching RleWriter/RleReader.
    fn pack_rle_buffer(bits: &[bool]) -> Vec<u8> {
        let num_bits = bits.len();
        let num_rle_bytes = num_bits.div_ceil(8);
        let mut buf = vec![0u8; num_rle_bytes + 1]; // num_bits < 128 so the trailer is one byte
        for (i, &bit) in bits.iter().enumerate() {
            if bit {
                buf[i / 8] |= 1 << (i % 8);
            }
        }
        buf[num_rle_bytes] = num_bits as u8;
        buf
    }

    // Leading value bit + the 4 bits that fall through tiers 1-4 + an 8-bit payload of
    // 255 (the escape sentinel), landing decode_run_length() in the varint-escape branch.
    fn escape_run_prefix_bits() -> Vec<bool> {
        let mut bits = vec![true, true, true, true, true];
        push_byte_bits_msb_first(&mut bits, 0xff);
        bits
    }

    #[test]
    #[should_panic(expected = "too long")]
    fn test_escape_varint_more_than_five_continuation_groups_panics() {
        let mut bits = escape_run_prefix_bits();
        for g in [0x81u8, 0x82, 0x84, 0x88, 0x90, 0x7f] {
            push_byte_bits_msb_first(&mut bits, g);
        }
        let buf = pack_rle_buffer(&bits);

        let mut reader = RleReader::new(&buf);
        reader.next_bit();
    }

    // Same 5-group buffer shape that made C#'s uint->int cast go negative in the original
    // cross-language investigation. Here the escape value itself (u32::MAX) decodes
    // exactly via the widened u64 accumulator -- it's only the final `RUN_LENGTH_ESCAPE +
    // extra` step that legitimately exceeds u32, which is what should_panic checks below.
    #[test]
    #[should_panic(expected = "overflows u32")]
    fn test_escape_value_overflowing_u32_panics() {
        // 5-group LEB128 encoding of u32::MAX (4294967295): payloads 127,127,127,127,15.
        let mut bits = escape_run_prefix_bits();
        for g in [0xffu8, 0xff, 0xff, 0xff, 0x0f] {
            push_byte_bits_msb_first(&mut bits, g);
        }
        let buf = pack_rle_buffer(&bits);

        let mut reader = RleReader::new(&buf);
        reader.next_bit();
    }

    #[test]
    fn test_escape_value_at_u32_max_boundary_round_trips() {
        // extra = u32::MAX - RUN_LENGTH_ESCAPE, so total lands exactly at u32::MAX --
        // the largest value that must NOT overflow (LEB128 payloads: 114,125,127,127,15).
        let mut bits = escape_run_prefix_bits();
        for g in [0xf2u8, 0xfd, 0xff, 0xff, 0x0f] {
            push_byte_bits_msb_first(&mut bits, g);
        }
        let buf = pack_rle_buffer(&bits);

        let mut reader = RleReader::new(&buf);
        assert!(reader.next_bit());
        assert_eq!(reader.remaining, u32::MAX - 1);
    }

    #[test]
    #[should_panic(expected = "larger than the buffer")]
    fn test_declared_bit_length_exceeding_buffer_panics() {
        // Trailer claims 40 encoded bits (5 RLE bytes), but the buffer is only 1 byte.
        let buf = [40u8];
        let mut reader = RleReader::new(&buf);
        reader.next_bit();
    }

    #[test]
    #[should_panic(expected = "Invalid varint")]
    fn test_reverse_uvarint_more_than_five_continuation_groups_panics() {
        // read_reverse_uvarint walks backward from the end of the buffer, so every byte
        // here (read in reverse order) carries the continuation bit with none ever
        // terminating. Before capping the loop at MAX_VARINT_BYTES, a longer run of
        // these would walk `i * 7` past 31 and hit a shift-overflow panic in debug
        // builds (or a masked, silently-wrong shift in release builds) instead of this
        // clean decode error.
        let buf = [0x81u8, 0x82, 0x84, 0x88, 0x90];
        let mut reader = RleReader::new(&buf);
        reader.next_bit();
    }

    #[test]
    #[should_panic(expected = "RLE stream overran its declared bit length")]
    fn test_bit_overrun_from_undersized_header_panics() {
        // Trailer claims only 1 encoded bit, but decode_run_length() always needs at
        // least 2 bits to determine even the shortest run (count == 1). A corrupted
        // header that's internally inconsistent -- but still within buffer bounds --
        // must be caught here rather than silently reading past the RLE region.
        let buf = [0b0000_0001u8, 1];
        let mut reader = RleReader::new(&buf);
        reader.next_bit();
    }

    // Cross-language wire-format fixture: a bit pattern that walks through short runs,
    // a single-varint-group escape run (300 = 269+31), a short run, and a
    // three-varint-group escape run (16653 = 269+16384), then a trailing short run.
    // Encoded independently in Rust, TypeScript, and C# and confirmed byte-identical --
    // this is the regression guard for that cross-language agreement, since none of the
    // shared example golden-vector fixtures contain a run long enough to hit the escape
    // sentinel at all.
    const CROSS_LANG_HEX: &str = "f6fff1fbff0101800041";

    fn cross_lang_bits() -> Vec<bool> {
        std::iter::repeat_n(false, 5)
            .chain(std::iter::repeat_n(true, 300))
            .chain(std::iter::repeat_n(false, 3))
            .chain(std::iter::repeat_n(true, 16653))
            .chain(std::iter::repeat_n(false, 1))
            .collect()
    }

    #[test]
    fn test_cross_lang_escape_tier_encode_matches_fixture() {
        let bits = cross_lang_bits();
        let mut writer = RleWriter::new();
        for &b in &bits {
            writer.push_bit(b);
        }
        let mut output = Vec::new();
        writer.write_to_buffer(&mut output);

        let hex: String = output.iter().map(|b| format!("{b:02x}")).collect();
        assert_eq!(hex, CROSS_LANG_HEX);
    }

    #[test]
    fn test_cross_lang_escape_tier_decode_from_fixture() {
        let bits = cross_lang_bits();
        let buf: Vec<u8> = (0..CROSS_LANG_HEX.len() / 2)
            .map(|i| u8::from_str_radix(&CROSS_LANG_HEX[i * 2..i * 2 + 2], 16).unwrap())
            .collect();

        let mut reader = RleReader::new(&buf);
        for &b in &bits {
            assert_eq!(reader.next_bit(), b);
        }
    }
}
