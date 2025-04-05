export function rleEncode(bits: boolean[]): boolean[] {
  let last = bits[0];
  let count = 1;
  const rleBits: boolean[] = [last];
  for (let i = 1; i <= bits.length; i++) {
    if (i < bits.length && bits[i] === last) {
      count++;
    } else {
      if (count <= 4) {
        rleBits.push(true);
        rleBits.push(...uintToBits(count - 1, 2));
      } else {
        rleBits.push(false);
        if (count <= 16) {
          rleBits.push(true);
          rleBits.push(...uintToBits(count - 1, 4));
        } else if (count <= 256) {
          rleBits.push(false);
          rleBits.push(...uintToBits(count - 1, 8));
        } else {
          throw new Error("RLE count too large: " + count);
        }
      }
      last = bits[i];
      count = 1;
    }
  }
  return rleBits;
}

export function rleDecode(rleBits: boolean[]): boolean[] {
  const bits: boolean[] = [];
  let idx = 0;
  let last = rleBits[idx++];
  while (idx < rleBits.length) {
    if (rleBits[idx++]) {
      const count = bitsToUint([rleBits[idx++], rleBits[idx++]]) + 1;
      for (let i = 0; i < count; i++) {
        bits.push(last);
      }
    } else {
      if (rleBits[idx++]) {
        const count = bitsToUint([rleBits[idx++], rleBits[idx++], rleBits[idx++], rleBits[idx++]]) + 1;
        for (let i = 0; i < count; i++) {
          bits.push(last);
        }
      } else {
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
          ]) + 1;
        for (let i = 0; i < count; i++) {
          bits.push(last);
        }
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
