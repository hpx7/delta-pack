#!/usr/bin/env node

import pkg from "../package.json";
import { generate } from "./commands/generate.js";
import { encode } from "./commands/encode.js";
import { decode } from "./commands/decode.js";
import { encodeDiff } from "./commands/encodeDiff.js";
import { decodeDiff } from "./commands/decodeDiff.js";
import { ArgError } from "./utils/errors.js";

// Handle EPIPE gracefully (e.g., when piping to a process that exits early)
process.stdout.on("error", (err) => {
  if (err.code === "EPIPE") {
    process.exit(0);
  }
  throw err;
});

const args = process.argv.slice(2);
const command = args[0];

function parseFlags(args: string[]): Map<string, string | true> {
  const flags = new Map<string, string | true>();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        flags.set(key, next);
        i++;
      } else {
        flags.set(key, true);
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      const key = arg.slice(1);
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        flags.set(key, next);
        i++;
      } else {
        flags.set(key, true);
      }
    }
  }
  return flags;
}

function getPositional(args: string[]): string | undefined {
  return args.find((a) => !a.startsWith("-"));
}

function printUsage(): void {
  console.log(`delta-pack CLI

Usage: delta-pack <command> [options]

Commands:
  generate <schema.yml> -l <lang> [-o output]    Generate code from schema
  encode <schema.yml> -t <type> [-i input] [-o output]
  decode <schema.yml> -t <type> [-i input] [-o output]
  encode-diff <schema.yml> -t <type> --old <file> --new <file> [-o output]
  decode-diff <schema.yml> -t <type> --old <file> [--diff <file>] [-o output]

Options:
  -l, --language   Target language (typescript, csharp)
  -t, --type       Type name to encode/decode
  -i, --input      Input file (default: stdin)
  -o, --output     Output file (default: stdout)
  --old            Old state JSON file
  --new            New state JSON file
  --diff           Diff binary file (default: stdin)
`);
}

async function main() {
  if (command === "--version" || command === "-v") {
    console.log(pkg.version);
    process.exit(0);
  }

  if (
    !command ||
    command === "help" ||
    command === "--help" ||
    command === "-h"
  ) {
    printUsage();
    process.exit(0);
  }

  const subArgs = args.slice(1);
  const flags = parseFlags(subArgs);
  const schema = getPositional(subArgs);

  try {
    switch (command) {
      case "generate":
        await generate(schema, flags);
        break;
      case "encode":
        await encode(schema, flags);
        break;
      case "decode":
        await decode(schema, flags);
        break;
      case "encode-diff":
        await encodeDiff(schema, flags);
        break;
      case "decode-diff":
        await decodeDiff(schema, flags);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error("Run 'delta-pack help' for usage");
        process.exit(1);
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    if (err instanceof ArgError) {
      console.error();
      printUsage();
    }
    process.exit(1);
  }
}

main();
