export function rleEncode(bits: boolean[]): boolean[] {
  let last = bits[0];
  let count = 1;
  const rleBits: boolean[] = [last];
  for (let i = 1; i <= bits.length; i++) {
    if (i < bits.length && bits[i] === last) {
      count++;
    } else {
      // Variable-length unary coding for run lengths
      if (count === 1) {
        rleBits.push(false);
      } else if (count === 2) {
        rleBits.push(true, false);
      } else if (count <= 4) {
        rleBits.push(true, true, false);
        rleBits.push(...uintToBits(count - 3, 1)); // 0-1 for values 3-4
      } else if (count <= 12) {
        rleBits.push(true, true, true, false);
        rleBits.push(...uintToBits(count - 5, 3)); // 0-7 for values 5-12
      } else if (count <= 268) {
        rleBits.push(true, true, true, true);
        rleBits.push(...uintToBits(count - 13, 8)); // 0-255 for values 13-268
      } else {
        throw new Error("RLE count too large: " + count);
      }
      last = bits[i];
      count = 1;
    }
  }
  return rleBits;
}

export function rleDecode(rleBits: boolean[]): boolean[] {
  // RLE encoding - decode starting from index 1
  const bits: boolean[] = [];
  let idx = 0;
  let last = rleBits[idx++];
  while (idx < rleBits.length) {
    // Variable-length unary decoding
    if (!rleBits[idx++]) {
      // '0' = run of 1
      bits.push(last);
    } else if (!rleBits[idx++]) {
      // '10' = run of 2
      for (let i = 0; i < 2; i++) {
        bits.push(last);
      }
    } else if (!rleBits[idx++]) {
      // '110' + 1 bit = run of 3-4
      const count = bitsToUint([rleBits[idx++]]) + 3;
      for (let i = 0; i < count; i++) {
        bits.push(last);
      }
    } else if (!rleBits[idx++]) {
      // '1110' + 3 bits = run of 5-12
      const count = bitsToUint([rleBits[idx++], rleBits[idx++], rleBits[idx++]]) + 5;
      for (let i = 0; i < count; i++) {
        bits.push(last);
      }
    } else {
      // '1111' + 8 bits = run of 13-268
      const count =
        bitsToUint([
          rleBits[idx++],
          rleBits[idx++],
          rleBits[idx++],
          rleBits[idx++],
          rleBits[idx++],
          rleBits[idx++],
          rleBits[idx++],
          rleBits[idx++],
        ]) + 13;
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
