export async function readInput(path: string | undefined): Promise<Uint8Array> {
  if (path) {
    return new Uint8Array(await Bun.file(path).arrayBuffer());
  }
  // Read from stdin
  const chunks: Uint8Array[] = [];
  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(chunk);
  }
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

export async function readJson(path: string | undefined): Promise<unknown> {
  const bytes = await readInput(path);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text);
}

export async function writeOutput(path: string | undefined, data: Uint8Array | string): Promise<void> {
  if (path) {
    await Bun.write(path, data);
  } else {
    if (typeof data === "string") {
      process.stdout.write(data);
    } else {
      process.stdout.write(data);
    }
  }
}
