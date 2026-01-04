import { Writer } from "bin-serde";

// RLE format: first bit is the starting value, then run lengths are encoded as:
// 0 = 1, 10x = 2-3, 110x = 4-5, 1110xxx = 6-13, 1111xxxxxxxx = 14-269

export class RleEncoder {
  private bytes: number[] = [];
  private currentByte = 0;
  private bitPos = 0;
  private totalBits = 0;
  private runValue = -1; // -1 = no run yet, 0 = false, 1 = true
  private runCount = 0;

  pushBit(val: boolean): void {
    const bit = val ? 1 : 0;
    if (this.runValue === -1) {
      this.runValue = bit;
      this.runCount = 1;
      this.writeBit(bit);
    } else if (bit === this.runValue) {
      this.runCount++;
    } else {
      this.emitRunLength(this.runCount);
      this.runValue = bit;
      this.runCount = 1;
    }
  }

  pushBits(val: number, numBits: number): void {
    for (let i = numBits - 1; i >= 0; i--) {
      this.pushBit(((val >> i) & 1) === 1);
    }
  }

  finalize(target: Writer): void {
    if (this.runValue === -1) {
      writeReverseUVarint(target, 0);
      return;
    }
    this.emitRunLength(this.runCount);
    if (this.bitPos > 0) {
      this.bytes.push(this.currentByte);
    }
    for (let i = 0; i < this.bytes.length; i++) {
      target.writeUInt8(this.bytes[i]!);
    }
    writeReverseUVarint(target, this.totalBits);
  }

  private writeBit(bit: number): void {
    if (bit) this.currentByte |= 1 << this.bitPos;
    if (++this.bitPos === 8) {
      this.bytes.push(this.currentByte);
      this.currentByte = 0;
      this.bitPos = 0;
    }
    this.totalBits++;
  }

  private writeBits(val: number, numBits: number): void {
    for (let i = numBits - 1; i >= 0; i--) {
      this.writeBit((val >> i) & 1);
    }
  }

  private emitRunLength(count: number): void {
    if (count === 1) {
      this.writeBit(0);
    } else if (count <= 3) {
      this.writeBits(0b100 | (count - 2), 3);
    } else if (count <= 5) {
      this.writeBits(0b1100 | (count - 4), 4);
    } else if (count <= 13) {
      this.writeBits((0b1110 << 3) | (count - 6), 7);
    } else if (count <= 269) {
      this.writeBits((0b1111 << 8) | (count - 14), 12);
    } else {
      throw new Error("RLE count too large: " + count);
    }
  }
}

export class RleDecoder {
  private buf: Uint8Array;
  private bytePos: number;
  private currentByte = 0;
  private bitPos = 8; // Start at 8 to trigger first byte read
  private currentValue: boolean;
  private runRemaining: number;

  constructor(buf: Uint8Array) {
    this.buf = buf;
    const { value: numBits, bytesRead: varintLen } = readReverseUVarint(buf);
    const numRleBytes = Math.ceil(numBits / 8);
    this.bytePos = buf.length - varintLen - numRleBytes;
    this.currentValue = this.readBit();
    this.runRemaining = this.decodeRunLength();
  }

  nextBit(): boolean {
    if (this.runRemaining === 0) {
      this.currentValue = !this.currentValue;
      this.runRemaining = this.decodeRunLength();
    }
    this.runRemaining--;
    return this.currentValue;
  }

  nextBits(numBits: number): number {
    let val = 0;
    for (let i = numBits - 1; i >= 0; i--) {
      if (this.nextBit()) {
        val |= 1 << i;
      }
    }
    return val;
  }

  private readBit(): boolean {
    if (this.bitPos === 8) {
      this.currentByte = this.buf[this.bytePos++]!;
      this.bitPos = 0;
    }
    return ((this.currentByte >> this.bitPos++) & 1) === 1;
  }

  private decodeRunLength(): number {
    if (!this.readBit()) return 1;
    if (!this.readBit()) return this.readBits(1) + 2;
    if (!this.readBit()) return this.readBits(1) + 4;
    if (!this.readBit()) return this.readBits(3) + 6;
    return this.readBits(8) + 14;
  }

  private readBits(numBits: number): number {
    let val = 0;
    for (let i = numBits - 1; i >= 0; i--) {
      if (this.readBit()) {
        val |= 1 << i;
      }
    }
    return val;
  }
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
