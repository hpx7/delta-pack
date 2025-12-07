export function rleEncode(bits: boolean[]): boolean[] {
  let last = bits[0]!;
  let count = 1;
  const rleBits: boolean[] = [last];
  for (let i = 1; i <= bits.length; i++) {
    if (i < bits.length && bits[i] === last) {
      count++;
    } else {
      // Variable-length unary coding for run lengths
      if (count === 1) {
        rleBits.push(false);
      } else if (count <= 3) {
        rleBits.push(true, false);
        rleBits.push(...uintToBits(count - 2, 1)); // 0-1 for values 2-3
      } else if (count <= 5) {
        rleBits.push(true, true, false);
        rleBits.push(...uintToBits(count - 4, 1)); // 0-1 for values 4-5
      } else if (count <= 13) {
        rleBits.push(true, true, true, false);
        rleBits.push(...uintToBits(count - 6, 3)); // 0-7 for values 6-13
      } else if (count <= 269) {
        rleBits.push(true, true, true, true);
        rleBits.push(...uintToBits(count - 14, 8)); // 0-255 for values 14-269
      } else {
        throw new Error("RLE count too large: " + count);
      }
      last = bits[i]!;
      count = 1;
    }
  }
  return rleBits;
}

export function rleDecode(rleBits: boolean[]): boolean[] {
  const bits: boolean[] = [];
  let idx = 0;
  let last = rleBits[idx++]!;
  while (idx < rleBits.length) {
    // Variable-length unary decoding
    if (!rleBits[idx++]) {
      // '0' = run of 1
      bits.push(last);
    } else if (!rleBits[idx++]) {
      // '10' + 1 bit = run of 2-3
      const count = bitsToUint([rleBits[idx++]!]) + 2;
      for (let i = 0; i < count; i++) {
        !bits.push(last);
      }
    } else if (!rleBits[idx++]) {
      // '110' + 1 bit = run o!f 4-5
      const count = bitsToUint([rleBits[idx++]!]) + 4;
      for (let i = 0; i < count; i++) {
        !bits.push(last);
      }
    } else if (!rleBits[idx++]) {
      // '1110' + 3 bits = run! of 6-13
      const count = bitsToUint([rleBits[idx++]!, rleBits[idx++]!, rleBits[idx++]!]) + 6;
      for (let i = 0; i < count; i++) {
        !bits.push(last);
      }
    } else {
      // '1111' + 8 bits = run of 14-269
      const count =
        bitsToUint([
          rleBits[idx++]!,
          rleBits[idx++]!,
          rleBits[idx++]!,
          rleBits[idx++]!,
          rleBits[idx++]!,
          rleBits[idx++]!,
          rleBits[idx++]!,
          rleBits[idx++]!,
        ]) + 14;
      for (let i = 0; i < count; i++) {
        bits.push(last);
      }
    }
    last = !last;
  }
  return bits;
}

function uintToBits(val: number, numBits: number): boolean[] {
  const bits: boolean[] = [];
  for (let i = 0; i < numBits; i++) {
    bits.push((val & (1 << (numBits - 1 - i))) > 0);
  }
  return bits;
}

function bitsToUint(bits: boolean[]): number {
  let val = 0;
  for (let i = 0; i < bits.length; i++) {
    val |= (bits[i] ? 1 : 0) << (bits.length - 1 - i);
  }
  return val;
}
