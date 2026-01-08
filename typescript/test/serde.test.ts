import { describe, it, expect } from "vitest";
import { utf8Size, utf8Write, utf8Read } from "../src/serde.js";

describe("serde UTF-8 functions", () => {
  // Helper to create a plain Uint8Array (not Buffer) for testing manual UTF-8 paths
  function toPlainUint8Array(buf: Uint8Array): Uint8Array {
    const plain = new Uint8Array(buf.length);
    plain.set(buf);
    return plain;
  }

  it("should handle ASCII strings with manual decoder", () => {
    const str = "Hello World";
    const size = utf8Size(str);
    const bytes = new Uint8Array(size);
    utf8Write(str, bytes, 0, size);

    // Convert to plain Uint8Array to force manual decode path
    const plain = toPlainUint8Array(bytes);
    const decoded = utf8Read(plain, 0, size);

    expect(decoded).toBe(str);
  });

  it("should handle 2-byte UTF-8 characters with manual decoder", () => {
    const str = "Héllo Wörld"; // Contains 2-byte chars (é, ö)
    const size = utf8Size(str);
    const bytes = new Uint8Array(size);
    utf8Write(str, bytes, 0, size);

    const plain = toPlainUint8Array(bytes);
    const decoded = utf8Read(plain, 0, size);

    expect(decoded).toBe(str);
  });

  it("should handle 3-byte UTF-8 characters with manual decoder", () => {
    const str = "Hello 世界"; // Chinese characters are 3 bytes
    const size = utf8Size(str);
    const bytes = new Uint8Array(size);
    utf8Write(str, bytes, 0, size);

    const plain = toPlainUint8Array(bytes);
    const decoded = utf8Read(plain, 0, size);

    expect(decoded).toBe(str);
  });

  it("should handle 4-byte UTF-8 characters (emojis) with manual decoder", () => {
    const str = "Hi 🎉🚀"; // Emojis are 4-byte UTF-8 (surrogate pairs)
    const size = utf8Size(str);
    const bytes = new Uint8Array(size);
    utf8Write(str, bytes, 0, size);

    const plain = toPlainUint8Array(bytes);
    const decoded = utf8Read(plain, 0, size);

    expect(decoded).toBe(str);
  });

  it("should handle mixed UTF-8 byte lengths with manual decoder", () => {
    const str = "A é 世 🎉"; // 1, 2, 3, and 4 byte characters
    const size = utf8Size(str);
    const bytes = new Uint8Array(size);
    utf8Write(str, bytes, 0, size);

    const plain = toPlainUint8Array(bytes);
    const decoded = utf8Read(plain, 0, size);

    expect(decoded).toBe(str);
  });

  it("should correctly calculate utf8Size for surrogate pairs", () => {
    // Each emoji is 4 bytes in UTF-8
    expect(utf8Size("🎉")).toBe(4);
    expect(utf8Size("🎉🚀")).toBe(8);
    expect(utf8Size("A🎉B")).toBe(6); // 1 + 4 + 1
  });
});
