import { Writer } from "bin-serde";

export function rleEncode(bits: boolean[], writer: Writer): void {
  if (bits.length === 0) {
    writeReverseUVarint(writer, 0);
    return;
  }

  let currentByte = 0;
  let bitPos = 0;
  let totalBits = 0;

  function writeBit(bit: boolean) {
    if (bit) {
      currentByte |= 1 << bitPos;
    }
    bitPos++;
    totalBits++;
    if (bitPos === 8) {
      writer.writeUInt8(currentByte);
      currentByte = 0;
      bitPos = 0;
    }
  }

  function writeBits(val: number, numBits: number) {
    for (let i = numBits - 1; i >= 0; i--) {
      writeBit((val & (1 << i)) > 0);
    }
  }

  let last = bits[0]!;
  let count = 1;
  writeBit(last);

  for (let i = 1; i <= bits.length; i++) {
    if (i < bits.length && bits[i] === last) {
      count++;
    } else {
      // Variable-length unary coding for run lengths
      if (count === 1) {
        writeBit(false);
      } else if (count <= 3) {
        writeBit(true);
        writeBit(false);
        writeBit(count === 3);
      } else if (count <= 5) {
        writeBit(true);
        writeBit(true);
        writeBit(false);
        writeBit(count === 5);
      } else if (count <= 13) {
        writeBit(true);
        writeBit(true);
        writeBit(true);
        writeBit(false);
        writeBits(count - 6, 3);
      } else if (count <= 269) {
        writeBit(true);
        writeBit(true);
        writeBit(true);
        writeBit(true);
        writeBits(count - 14, 8);
      } else {
        throw new Error("RLE count too large: " + count);
      }
      last = bits[i]!;
      count = 1;
    }
  }

  // Flush remaining bits
  if (bitPos > 0) {
    writer.writeUInt8(currentByte);
  }

  writeReverseUVarint(writer, totalBits);
}

/**
 * Creates a lazy RLE bit reader - decodes bits on-demand instead of upfront.
 * Returns a function that yields the next boolean on each call.
 */
export function rleDecode(buf: Uint8Array): () => boolean {
  const { value: numBits, bytesRead: varintLen } = readReverseUVarint(buf);

  const numRleBytes = Math.ceil(numBits / 8);
  let bytePos = buf.length - varintLen - numRleBytes;
  let currentByte = 0;
  let bitPos = 8; // Start at 8 to trigger first byte read
  let currentValue = readBit();
  let runRemaining = decodeRunLength();

  function decodeRunLength(): number {
    if (!readBit()) return 1;
    if (!readBit()) return readBits(1) + 2;
    if (!readBit()) return readBits(1) + 4;
    if (!readBit()) return readBits(3) + 6;
    return readBits(8) + 14;
  }

  function readBit(): boolean {
    if (bitPos === 8) {
      currentByte = buf[bytePos++]!;
      bitPos = 0;
    }
    return ((currentByte >> bitPos++) & 1) === 1;
  }

  function readBits(numBits: number): number {
    let val = 0;
    for (let i = numBits - 1; i >= 0; i--) {
      if (readBit()) {
        val |= 1 << i;
      }
    }
    return val;
  }

  return () => {
    if (runRemaining === 0) {
      currentValue = !currentValue;
      runRemaining = decodeRunLength();
    }
    runRemaining--;
    return currentValue;
  };
}

function writeReverseUVarint(writer: Writer, val: number) {
  if (val < 0x80) {
    writer.writeUInt8(val);
  } else {
    writeReverseUVarint(writer, val >> 7);
    writer.writeUInt8((val & 0x7f) | 0x80);
  }
}

function readReverseUVarint(buf: Uint8Array) {
  let value = 0;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[buf.length - 1 - i]!;
    value |= (byte & 0x7f) << (i * 7);
    if (byte < 0x80) {
      return { value, bytesRead: i + 1 };
    }
  }
  throw new Error("Invalid varint");
}
