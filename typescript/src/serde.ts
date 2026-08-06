const hasBuffer = typeof Buffer !== "undefined";
export const copyBuffer = hasBuffer ? (buf: Uint8Array) => Buffer.from(buf) : (buf: Uint8Array) => buf.slice();

// slab allocation
const SLAB_SIZE = 8192;
const MAX_POOLED = 4096;

let slab = allocUint8Array(SLAB_SIZE);
let slabOffset = 0;

export function allocFromSlab(size: number): Uint8Array {
  if (size > MAX_POOLED) {
    return allocUint8Array(size);
  }
  if (slabOffset + size > SLAB_SIZE) {
    slab = allocUint8Array(SLAB_SIZE);
    slabOffset = 0;
  }
  const buf = slab.subarray(slabOffset, slabOffset + size);
  slabOffset += size;
  return buf;
}

function allocUint8Array(size: number): Uint8Array {
  return hasBuffer ? Buffer.allocUnsafe(size) : new Uint8Array(size);
}

// float encoding
const f32 = new Float32Array(1);
const f32u8 = new Uint8Array(f32.buffer);

export function floatWrite(val: number, bytes: Uint8Array, pos: number) {
  f32[0] = val;
  bytes[pos] = f32u8[0]!;
  bytes[pos + 1] = f32u8[1]!;
  bytes[pos + 2] = f32u8[2]!;
  bytes[pos + 3] = f32u8[3]!;
}

export function floatRead(bytes: Uint8Array, pos: number): number {
  f32u8[0] = bytes[pos]!;
  f32u8[1] = bytes[pos + 1]!;
  f32u8[2] = bytes[pos + 2]!;
  f32u8[3] = bytes[pos + 3]!;
  return f32[0]!;
}

// string encoding
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function utf8Encode(val: string, bytes: Uint8Array, pos: number): number {
  let index = pos;
  let c1: number, c2: number;
  for (let i = 0; i < val.length; i++) {
    c1 = val.charCodeAt(i);
    if (c1 < 128) {
      bytes[index++] = c1;
    } else if (c1 < 2048) {
      bytes[index++] = (c1 >> 6) | 192;
      bytes[index++] = (c1 & 63) | 128;
    } else if ((c1 & 0xfc00) === 0xd800 && ((c2 = val.charCodeAt(i + 1)) & 0xfc00) === 0xdc00) {
      c1 = 0x10000 + ((c1 & 0x03ff) << 10) + (c2 & 0x03ff);
      i++;
      bytes[index++] = (c1 >> 18) | 240;
      bytes[index++] = ((c1 >> 12) & 63) | 128;
      bytes[index++] = ((c1 >> 6) & 63) | 128;
      bytes[index++] = (c1 & 63) | 128;
    } else {
      bytes[index++] = (c1 >> 12) | 224;
      bytes[index++] = ((c1 >> 6) & 63) | 128;
      bytes[index++] = (c1 & 63) | 128;
    }
  }
  return index - pos;
}

export function utf8Size(str: string): number {
  let bytes = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const codePoint = str.codePointAt(i)!;
    if (codePoint < 0x80) {
      bytes++;
    } else if (codePoint < 0x800) {
      bytes += 2;
    } else if (codePoint < 0x10000) {
      bytes += 3;
    } else {
      bytes += 4;
      i++; // skip surrogate pair
    }
  }
  return bytes;
}

export function utf8Write(val: string, bytes: Uint8Array, pos: number, len: number) {
  if (hasBuffer && Buffer.isBuffer(bytes)) {
    bytes.write(val, pos, "utf8");
  } else if (len > 64) {
    textEncoder.encodeInto(val, bytes.subarray(pos));
  } else {
    utf8Encode(val, bytes, pos);
  }
}

export function utf8Read(bytes: Uint8Array, start: number, len: number): string {
  if (hasBuffer && Buffer.isBuffer(bytes)) {
    return bytes.toString("utf8", start, start + len);
  }
  if (len > 64) {
    return textDecoder.decode(bytes.subarray(start, start + len));
  }
  const chunks: number[] = [];
  let i = 0;
  let t: number;
  let pos = start;
  const end = start + len;
  while (pos < end) {
    t = bytes[pos++]!;
    if (t < 128) {
      chunks[i++] = t;
    } else if (t > 191 && t < 224) {
      chunks[i++] = ((t & 31) << 6) | (bytes[pos++]! & 63);
    } else if (t > 239 && t < 245) {
      t =
        (((t & 7) << 18) | ((bytes[pos++]! & 63) << 12) | ((bytes[pos++]! & 63) << 6) | (bytes[pos++]! & 63)) - 0x10000;
      chunks[i++] = 0xd800 + (t >> 10);
      chunks[i++] = 0xdc00 + (t & 1023);
    } else {
      chunks[i++] = ((t & 15) << 12) | ((bytes[pos++]! & 63) << 6) | (bytes[pos++]! & 63);
    }
  }
  return String.fromCharCode.apply(String, chunks);
}

// bits encoding

// Tier 5 payload is 8 bits (values 0-255), mapping to counts 14-269. Value 255 is
// reserved as an escape sentinel so counts >= 269 stay representable: the true count
// is `269 + varint`, keeping the byte cost for the common 14-268 range unchanged.
const RUN_LENGTH_ESCAPE = 269;
const RUN_LENGTH_ESCAPE_SENTINEL = 255;
// LEB128 varints here never need more than 5 continuation bytes for any value this
// format needs to represent; capping both varint readers below bounds a corrupted or
// adversarial stream's cost and keeps the accumulated value far under
// Number.MAX_SAFE_INTEGER.
const MAX_VARINT_BYTES = 5;

export class RleWriter {
  private bytes: number[] = [];
  private byte = 0;
  private bitPos = 0;
  private totalBits = 0;
  private runValue = -1;
  private runCount = 0;

  reset() {
    this.bytes = [];
    this.byte = 0;
    this.bitPos = 0;
    this.totalBits = 0;
    this.runValue = -1;
    this.runCount = 0;
  }

  pushBit(val: boolean) {
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

  pushBits(val: number, numBits: number) {
    for (let i = numBits - 1; i >= 0; i--) {
      this.pushBit(((val >> i) & 1) === 1);
    }
  }

  toBytes(): number[] {
    if (this.runValue === -1) {
      return [0];
    }
    this.emitRunLength(this.runCount);
    if (this.bitPos > 0) {
      this.bytes.push(this.byte);
    }
    this.writeReverseUVarint(this.totalBits);
    return this.bytes;
  }

  private writeReverseUVarint(val: number) {
    if (val < 0x80) {
      this.bytes.push(val);
    } else {
      this.writeReverseUVarint(val >> 7);
      this.bytes.push((val & 0x7f) | 0x80);
    }
  }

  private writeBit(bit: number) {
    if (bit) this.byte |= 1 << this.bitPos;
    if (++this.bitPos === 8) {
      this.bytes.push(this.byte);
      this.byte = 0;
      this.bitPos = 0;
    }
    this.totalBits++;
  }

  private writeBits(val: number, numBits: number) {
    for (let i = numBits - 1; i >= 0; i--) {
      this.writeBit((val >> i) & 1);
    }
  }

  private emitRunLength(count: number) {
    if (count === 1) {
      this.writeBit(0);
    } else if (count <= 3) {
      this.writeBits(0b100 | (count - 2), 3);
    } else if (count <= 5) {
      this.writeBits(0b1100 | (count - 4), 4);
    } else if (count <= 13) {
      this.writeBits((0b1110 << 3) | (count - 6), 7);
    } else if (count < RUN_LENGTH_ESCAPE) {
      this.writeBits((0b1111 << 8) | (count - 14), 12);
    } else {
      this.writeBits((0b1111 << 8) | RUN_LENGTH_ESCAPE_SENTINEL, 12);
      this.writeUVarintBits(count - RUN_LENGTH_ESCAPE);
    }
  }

  private writeUVarintBits(val: number) {
    while (val >= 0x80) {
      this.writeBits((val & 0x7f) | 0x80, 8);
      val = val >>> 7;
    }
    this.writeBits(val, 8);
  }
}

export class RleReader {
  private buf!: Uint8Array;
  private bytePos = 0;
  private byte = 0;
  private bitPos = 8;
  private value = false;
  private remaining = 0;
  private initialized = false;

  // Ground truth for how many encoded bits this buffer's RLE region contains, taken
  // from the trailing reverse-varint written by the encoder. Every readBit() call is
  // checked against it so a corrupted run-length code fails fast instead of silently
  // reading past the end of its own region.
  private numBits = 0;
  private bitsRead = 0;

  reset(buf: Uint8Array) {
    this.buf = buf;
    this.byte = 0;
    this.bitPos = 8;
    this.bitsRead = 0;

    const { numBits, varintLen } = this.readReverseUVarint(buf);
    if (numBits === 0) {
      this.initialized = false;
      return;
    }

    const numRleBytes = Math.ceil(numBits / 8);
    if (varintLen + numRleBytes > buf.length) {
      throw new Error("RLE header declares a bit length larger than the buffer");
    }

    this.numBits = numBits;
    this.bytePos = buf.length - varintLen - numRleBytes;
    this.value = this.readBit();
    this.remaining = this.decodeRunLength();
    this.initialized = true;
  }

  nextBit(): boolean {
    if (!this.initialized) {
      throw new Error("No bits to read");
    }

    if (this.remaining === 0) {
      this.value = !this.value;
      this.remaining = this.decodeRunLength();
    }
    this.remaining--;
    return this.value;
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

  // Arithmetic accumulation (not bitwise <</|=) is deliberate: JS's bitwise operators
  // coerce to a 32-bit signed result, so a corrupted/adversarial stream with enough
  // continuation bytes could otherwise set bit 31 and go negative, exactly like the
  // equivalent uint->int cast bug in the C#/Rust ports. Plain +/* never goes negative
  // and (bounded by MAX_VARINT_BYTES below) never approaches Number.MAX_SAFE_INTEGER,
  // so no separate overflow check is needed here.
  private readReverseUVarint(buf: Uint8Array) {
    let numBits = 0;
    let factor = 1;
    for (let i = 0; i < buf.length && i < MAX_VARINT_BYTES; i++) {
      const byte = buf[buf.length - 1 - i]!;
      numBits += (byte & 0x7f) * factor;
      if (byte < 0x80) {
        return { numBits, varintLen: i + 1 };
      }
      factor *= 128;
    }
    throw new Error("Invalid varint");
  }

  private readBit(): boolean {
    if (this.bitsRead++ >= this.numBits) {
      throw new Error("RLE stream overran its declared bit length");
    }

    if (this.bitPos === 8) {
      this.byte = this.buf[this.bytePos++]!;
      this.bitPos = 0;
    }
    return ((this.byte >> this.bitPos++) & 1) === 1;
  }

  private decodeRunLength(): number {
    if (!this.readBit()) return 1;
    if (!this.readBit()) return this.readBits(1) + 2;
    if (!this.readBit()) return this.readBits(1) + 4;
    if (!this.readBit()) return this.readBits(3) + 6;

    const payload = this.readBits(8);
    if (payload < RUN_LENGTH_ESCAPE_SENTINEL) {
      return payload + 14;
    }
    return RUN_LENGTH_ESCAPE + this.readUVarintBits();
  }

  private readUVarintBits(): number {
    let result = 0;
    let factor = 1;
    for (let group = 0; group < MAX_VARINT_BYTES; group++) {
      const b = this.readBits(8);
      result += (b & 0x7f) * factor;
      if (b < 0x80) {
        return result;
      }
      factor *= 128;
    }
    throw new Error("RLE escape varint too long");
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
