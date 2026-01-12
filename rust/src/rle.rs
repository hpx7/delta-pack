/// Streaming RLE (Run-Length Encoding) for bits.
/// Encodes sequences of same-valued bits efficiently.

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
        } else if count <= 269 {
            self.write_bits((0b1111 << 8) | (count - 14), 12);
        } else {
            panic!("RLE count too large: {}", count);
        }
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

        let num_rle_bytes = (num_bits + 7) / 8;
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
        self.read_bits(8) + 14
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
    for i in 1..buf.len() {
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
}
