import { describe, it, expect } from "vitest";
import { RleWriter, RleReader } from "../src/serde.js";

function encode(bits: boolean[]): Uint8Array {
  const writer = new RleWriter();
  for (const bit of bits) writer.pushBit(bit);
  return new Uint8Array(writer.toBytes());
}

function decode(encoded: Uint8Array, expectedBits: number): boolean[] {
  if (expectedBits === 0) return [];
  const reader = new RleReader();
  reader.reset(encoded);
  const bits: boolean[] = [];
  for (let i = 0; i < expectedBits; i++) bits.push(reader.nextBit());
  return bits;
}

// Independent re-derivation of the writer's bit cost, used to prove the escape-sentinel
// fix does not change the wire cost for counts 1-268 (the pre-fix representable range)
// and that counts >= 269 cost exactly "12 bits + one bit-level LEB128 varint".
function expectedRunLengthBits(count: number): number {
  if (count === 1) return 1;
  if (count <= 3) return 3;
  if (count <= 5) return 4;
  if (count <= 13) return 7;
  if (count <= 268) return 12;

  let groups = 0;
  let v = count - 269;
  do {
    groups++;
    v = Math.floor(v / 128);
  } while (v > 0);
  return 12 + groups * 8;
}

function expectedVarintLength(val: number): number {
  let len = 0;
  do {
    len++;
    val = Math.floor(val / 128);
  } while (val > 0);
  return len;
}

function expectedEncodedByteLength(count: number): number {
  const totalBits = 1 + expectedRunLengthBits(count); // leading value bit + run-length code
  const rleBytes = Math.ceil(totalBits / 8);
  return rleBytes + expectedVarintLength(totalBits);
}

function encodeUniformRun(count: number, value: boolean): Uint8Array {
  return encode(new Array(count).fill(value));
}

// -- Malformed / adversarial input helpers -------------------------------------------
// These hand-craft raw wire bytes directly (bypassing RleWriter) to simulate a
// corrupted or hostile buffer reaching RleReader -- something RleWriter itself can
// never produce, since it never emits values outside these encodings' valid ranges.

function addByteBitsMsbFirst(bits: boolean[], value: number) {
  for (let i = 7; i >= 0; i--) {
    bits.push(((value >> i) & 1) === 1);
  }
}

// Bits are packed LSB-first within each byte, matching RleWriter/RleReader.
function packRleBuffer(bits: boolean[]): Uint8Array {
  const numBits = bits.length;
  const numRleBytes = Math.ceil(numBits / 8);
  const buf = new Uint8Array(numRleBytes + 1); // numBits < 128 so the trailer is one byte
  bits.forEach((bit, i) => {
    if (bit) buf[Math.floor(i / 8)]! |= 1 << i % 8;
  });
  buf[numRleBytes] = numBits;
  return buf;
}

// Initial value bit + the 4 bits that fall through tiers 1-4 + an 8-bit payload of 255
// (the escape sentinel), landing decodeRunLength() in the varint-escape branch.
function escapeRunPrefixBits(): boolean[] {
  const bits = [true, true, true, true, true];
  addByteBitsMsbFirst(bits, 0xff);
  return bits;
}

describe("RleWriter/RleReader", () => {
  it("round-trips empty bits", () => {
    expect(decode(encode([]), 0)).toEqual([]);
  });

  it("round-trips a single true bit", () => {
    const bits = [true];
    expect(decode(encode(bits), bits.length)).toEqual(bits);
  });

  it("round-trips a single false bit", () => {
    const bits = [false];
    expect(decode(encode(bits), bits.length)).toEqual(bits);
  });

  it("round-trips alternating bits", () => {
    const bits = [true, false, true, false, true, false];
    expect(decode(encode(bits), bits.length)).toEqual(bits);
  });

  it.each([2, 3, 5, 13, 100, 269])("round-trips a uniform run of %i", (count) => {
    const bits = new Array(count).fill(true);
    expect(decode(encode(bits), bits.length)).toEqual(bits);
  });

  it("round-trips mixed runs", () => {
    const bits = [
      ...new Array(3).fill(true),
      ...new Array(5).fill(false),
      ...new Array(1).fill(true),
      ...new Array(10).fill(false),
      ...new Array(2).fill(true),
    ];
    expect(decode(encode(bits), bits.length)).toEqual(bits);
  });

  it("round-trips a large random pattern", () => {
    let seed = 42;
    const rand = () => {
      // Deterministic LCG so this test is reproducible across runs.
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed % 2;
    };
    const bits = Array.from({ length: 1000 }, () => rand() === 1);
    expect(decode(encode(bits), bits.length)).toEqual(bits);
  });

  // Before the escape-sentinel fix, a run of 270 identical bits overflowed RLE's tier-5
  // tier (max representable count was 269) and threw. This must now round-trip like any
  // other run length.
  it("round-trips a run of 270 (the original overflow boundary)", () => {
    const bits = new Array(270).fill(true);
    expect(decode(encode(bits), bits.length)).toEqual(bits);
  });

  it.each([
    268, // last count representable without the escape sentinel
    269, // first count that now requires the escape (payload 255, varint(0))
    270,
    271,
    300,
    396, // 269 + 127: largest count using a single 7-bit varint group
    397, // 269 + 128: smallest count needing a second varint group
    5000,
    16652, // 269 + 16383: largest count using two varint groups
    16653, // 269 + 16384: smallest count needing a third varint group
    100_000,
    1_000_000,
    5_000_000,
  ])("round-trips a boundary run length of %i", (count) => {
    const bits = new Array(count).fill(true);
    expect(decode(encode(bits), bits.length)).toEqual(bits);
  });

  it("keeps byte cost unchanged for counts 1-268", () => {
    for (let count = 1; count <= 268; count++) {
      const output = encodeUniformRun(count, true);
      expect(output.length).toBe(expectedEncodedByteLength(count));
      expect(decode(output, count)).toEqual(new Array(count).fill(true));
    }
  });

  it.each([269, 270, 300, 396, 397, 1000, 5000, 16652, 16653, 100_000, 1_000_000])(
    "escape cost matches the varint formula for count %i",
    (count) => {
      const output = encodeUniformRun(count, false);
      expect(output.length).toBe(expectedEncodedByteLength(count));
    },
  );

  it.each([1, 2, 3, 4, 5])("round-trips mixed short and escape-tier runs (seed %i)", (seed) => {
    let state = seed;
    const rand = (max: number) => {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state % max;
    };

    const bits: boolean[] = [];
    let value = rand(2) === 1;
    for (let segment = 0; segment < 200; segment++) {
      const runLength = rand(100) < 15 ? 500 + rand(19_500) : 1 + rand(299);
      bits.push(...new Array(runLength).fill(value));
      value = !value;
    }

    expect(decode(encode(bits), bits.length)).toEqual(bits);
  });

  it("compresses long runs", () => {
    const output = encode(new Array(100).fill(true));
    expect(output.length).toBeLessThan(10);
  });

  // A message with zero tracked boolean/enum fields legitimately produces a 1-byte
  // "empty" encoding (numBits === 0). Decoder.reset() is called unconditionally for
  // every message regardless of whether it has any RLE-tracked fields, so reset() must
  // not itself fail or silently read garbage -- it should only throw if nextBit() is
  // actually (incorrectly) called afterward.
  describe("zero-bit (empty) encodings", () => {
    it("reset() does not throw on an empty encoding", () => {
      const reader = new RleReader();
      expect(() => reader.reset(encode([]))).not.toThrow();
    });

    it("nextBit() throws cleanly if called after an empty encoding", () => {
      const reader = new RleReader();
      reader.reset(encode([]));
      expect(() => reader.nextBit()).toThrow(/No bits to read/);
    });
  });

  describe("malformed input", () => {
    // Bounds the escape varint at 5 continuation groups. Without this cap, an
    // adversarial/corrupted stream could keep supplying continuation bytes indefinitely;
    // arithmetic accumulation (see readUVarintBits) prevents any C#/Rust-style sign flip,
    // but an unbounded stream could still degrade into silent precision loss or Infinity
    // for a sufficiently long run of continuation bytes.
    it("throws on more than 5 escape-varint continuation groups", () => {
      const bits = escapeRunPrefixBits();
      for (const g of [0x81, 0x82, 0x84, 0x88, 0x90, 0x7f]) addByteBitsMsbFirst(bits, g);
      const buf = packRleBuffer(bits);

      const reader = new RleReader();
      expect(() => reader.reset(buf)).toThrow(/too long/);
    });

    // The same 5-group buffer that made C#'s uint->int cast go negative (proven in the
    // C# test suite / PR investigation). Here it's a well-formed <=5-byte LEB128 varint
    // decoding to exactly 2^31 via extra += 8 * 128^4 -- arithmetic accumulation handles
    // this as a plain (large but valid, positive) number, with no analogous overflow to
    // guard against.
    it("decodes a >= 2^31 escape value correctly instead of overflowing", () => {
      const bits = escapeRunPrefixBits();
      for (const g of [0x81, 0x82, 0x84, 0x88, 0x08]) addByteBitsMsbFirst(bits, g);
      const buf = packRleBuffer(bits);

      const reader = new RleReader();
      expect(() => reader.reset(buf)).not.toThrow();
      // 269 + (1 + 256 + 65536 + 16777216 + 8 * 128^4) = 269 + 2164326657
      expect((reader as unknown as { remaining: number }).remaining).toBe(2164326926);
    });

    // The trailer claims 5 encoded bits, but a 1-byte buffer has no room for both that
    // region and the trailer itself.
    it("throws when the declared bit length exceeds the buffer", () => {
      const reader = new RleReader();
      expect(() => reader.reset(new Uint8Array([5]))).toThrow(/larger than the buffer/);
    });
  });

  // Cross-language wire-format fixture: a bit pattern that walks through short runs,
  // a single-varint-group escape run (300 = 269+31), a short run, and a
  // three-varint-group escape run (16653 = 269+16384), then a trailing short run.
  // Encoded independently in Rust, TypeScript, and C# and confirmed byte-identical --
  // this is the regression guard for that cross-language agreement, since none of the
  // shared example golden-vector fixtures contain a run long enough to hit the escape
  // sentinel at all.
  const CROSS_LANG_HEX = "f6fff1fbff0101800041";

  function crossLangBits(): boolean[] {
    return [
      ...new Array(5).fill(false),
      ...new Array(300).fill(true),
      ...new Array(3).fill(false),
      ...new Array(16653).fill(true),
      ...new Array(1).fill(false),
    ];
  }

  it("cross-language escape-tier encode matches fixture", () => {
    const output = encode(crossLangBits());
    expect(Buffer.from(output).toString("hex")).toBe(CROSS_LANG_HEX);
  });

  it("cross-language escape-tier decode from fixture", () => {
    const buf = new Uint8Array(Buffer.from(CROSS_LANG_HEX, "hex"));
    expect(decode(buf, crossLangBits().length)).toEqual(crossLangBits());
  });
});
