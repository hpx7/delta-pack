import { readFile, writeFile } from "node:fs/promises";

export async function readInput(path: string | undefined): Promise<Uint8Array> {
  if (path) {
    return new Uint8Array(await readFile(path));
  }
  // Read from stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return new Uint8Array(Buffer.concat(chunks));
}

export async function readJson(path: string | undefined): Promise<unknown> {
  const bytes = await readInput(path);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text);
}

export async function writeOutput(
  path: string | undefined,
  data: Uint8Array | string,
): Promise<void> {
  if (path) {
    await writeFile(path, data);
  } else {
    process.stdout.write(data);
  }
}
