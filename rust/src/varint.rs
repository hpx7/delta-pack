//! Varint encoding/decoding using protobuf-style LEB128 format.
//! Uses little-endian (lower 7 bits first) with MSB continuation bit.

/// Write an unsigned varint to a Vec, appending bytes.
#[inline]
pub fn write_uvarint_vec(output: &mut Vec<u8>, mut val: u64) {
    // Fast path for single-byte values (0-127) - most common case
    if val < 0x80 {
        output.push(val as u8);
        return;
    }
    // Reserve space for worst case (10 bytes for u64) and write directly
    output.reserve(10);
    let len = output.len();
    // SAFETY: We just reserved 10 bytes, and varint is at most 10 bytes
    unsafe {
        let ptr = output.as_mut_ptr().add(len);
        let mut pos = 0;
        while val >= 0x80 {
            *ptr.add(pos) = (val as u8) | 0x80;
            pos += 1;
            val >>= 7;
        }
        *ptr.add(pos) = val as u8;
        output.set_len(len + pos + 1);
    }
}

/// Write a signed varint to a Vec using zigzag encoding.
/// Zigzag: 0→0, -1→1, 1→2, -2→3, 2→4, ...
pub fn write_varint_vec(output: &mut Vec<u8>, val: i64) {
    let unsigned = ((val << 1) ^ (val >> 63)) as u64;
    write_uvarint_vec(output, unsigned);
}

/// Read an unsigned varint from buffer, returning (value, bytes_read).
#[inline]
pub fn read_uvarint(buf: &[u8], pos: usize) -> (u64, usize) {
    // Fast path for single-byte values (0-127) - most common case
    let b0 = buf[pos];
    if b0 < 0x80 {
        return (b0 as u64, 1);
    }

    let mut result = (b0 & 0x7F) as u64;
    let mut shift = 7;
    let mut i = pos + 1;
    loop {
        let b = buf[i];
        i += 1;
        result |= ((b & 0x7F) as u64) << shift;
        if b < 0x80 {
            return (result, i - pos);
        }
        shift += 7;
    }
}

/// Read a signed varint using zigzag decoding.
#[inline]
pub fn read_varint(buf: &[u8], pos: usize) -> (i64, usize) {
    let (unsigned, bytes_read) = read_uvarint(buf, pos);
    // Zigzag decode using bitwise ops to avoid overflow with i64::MIN
    let signed = ((unsigned >> 1) as i64) ^ (-((unsigned & 1) as i64));
    (signed, bytes_read)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_uvarint_roundtrip() {
        for val in [0u64, 1, 127, 128, 255, 256, 16383, 16384, u64::MAX] {
            let mut buf = Vec::new();
            write_uvarint_vec(&mut buf, val);
            let (decoded, read) = read_uvarint(&buf, 0);
            assert_eq!(val, decoded);
            assert_eq!(buf.len(), read);
        }
    }

    #[test]
    fn test_varint_roundtrip() {
        for val in [0i64, 1, -1, 2, -2, 63, -64, 64, -65, i64::MAX, i64::MIN] {
            let mut buf = Vec::new();
            write_varint_vec(&mut buf, val);
            let (decoded, read) = read_varint(&buf, 0);
            assert_eq!(val, decoded);
            assert_eq!(buf.len(), read);
        }
    }

    #[test]
    fn test_zigzag_encoding() {
        let mut buf = Vec::new();

        // 0 → 0
        write_varint_vec(&mut buf, 0);
        assert_eq!(buf[0], 0);

        // -1 → 1
        buf.clear();
        write_varint_vec(&mut buf, -1);
        assert_eq!(buf[0], 1);

        // 1 → 2
        buf.clear();
        write_varint_vec(&mut buf, 1);
        assert_eq!(buf[0], 2);

        // -2 → 3
        buf.clear();
        write_varint_vec(&mut buf, -2);
        assert_eq!(buf[0], 3);
    }
}
