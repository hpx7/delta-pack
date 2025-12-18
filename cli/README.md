# delta-pack CLI

Command-line tool for working with delta-pack schemas and binary data.

## Installation

```bash
npm install -g @hpx7/delta-pack-cli
# or
npx delta-pack <command>
```

## Commands

### generate

Generate code from a YAML schema.

```bash
delta-pack generate <schema.yml> -l <language> [-o output]
```

| Flag                    | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `-l, --language <lang>` | Target language: `typescript`/`ts`, `csharp`/`cs` |
| `-o, --output <file>`   | Output file (default: stdout)                     |

Examples:

```bash
# Output to stdout
delta-pack generate schema.yml -l typescript

# Output to file
delta-pack generate schema.yml -l typescript -o generated.ts

# Pipe to formatter
delta-pack generate schema.yml -l ts | prettier --stdin-filepath gen.ts > generated.ts
```

### encode

Encode JSON to binary.

```bash
delta-pack encode <schema.yml> -t <type> [-i input] [-o output]
```

| Flag                  | Description                          |
| --------------------- | ------------------------------------ |
| `-t, --type <name>`   | Type name (required)                 |
| `-i, --input <file>`  | JSON input file (default: stdin)     |
| `-o, --output <file>` | Binary output file (default: stdout) |

Examples:

```bash
# File to file
delta-pack encode schema.yml -t Player -i player.json -o player.bin

# Stdin to stdout
cat player.json | delta-pack encode schema.yml -t Player > player.bin

# Stdin to file
delta-pack encode schema.yml -t Player -o player.bin < player.json
```

### decode

Decode binary to JSON.

```bash
delta-pack decode <schema.yml> -t <type> [-i input] [-o output]
```

| Flag                  | Description                        |
| --------------------- | ---------------------------------- |
| `-t, --type <name>`   | Type name (required)               |
| `-i, --input <file>`  | Binary input file (default: stdin) |
| `-o, --output <file>` | JSON output file (default: stdout) |

Examples:

```bash
# File to file
delta-pack decode schema.yml -t Player -i player.bin -o player.json

# Stdin to stdout
cat player.bin | delta-pack decode schema.yml -t Player

# Roundtrip
delta-pack encode schema.yml -t Player -i player.json | delta-pack decode schema.yml -t Player
```

### encode-diff

Encode the diff between two JSON states to binary.

```bash
delta-pack encode-diff <schema.yml> -t <type> --old <file> --new <file> [-o output]
```

| Flag                  | Description                          |
| --------------------- | ------------------------------------ |
| `-t, --type <name>`   | Type name (required)                 |
| `--old <file>`        | Old state JSON file (required)       |
| `--new <file>`        | New state JSON file (required)       |
| `-o, --output <file>` | Binary output file (default: stdout) |

Examples:

```bash
# Output to file
delta-pack encode-diff schema.yml -t GameState --old state1.json --new state2.json -o diff.bin

# Output to stdout
delta-pack encode-diff schema.yml -t GameState --old state1.json --new state2.json > diff.bin
```

### decode-diff

Apply a binary diff to a JSON state.

```bash
delta-pack decode-diff <schema.yml> -t <type> --old <file> [--diff <file>] [-o output]
```

| Flag                  | Description                        |
| --------------------- | ---------------------------------- |
| `-t, --type <name>`   | Type name (required)               |
| `--old <file>`        | Old state JSON file (required)     |
| `--diff <file>`       | Binary diff file (default: stdin)  |
| `-o, --output <file>` | JSON output file (default: stdout) |

Examples:

```bash
# File to file
delta-pack decode-diff schema.yml -t GameState --old state1.json --diff diff.bin -o state2.json

# Diff from stdin
delta-pack encode-diff schema.yml -t GameState --old state1.json --new state2.json | \
  delta-pack decode-diff schema.yml -t GameState --old state1.json
```

## Inspecting Binary Output

```bash
# View binary as hex dump
delta-pack encode schema.yml -t Player -i player.json | xxd

# Check encoded size in bytes
delta-pack encode schema.yml -t Player -i player.json | wc -c

# Compare full encode vs diff size
delta-pack encode schema.yml -t GameState -i state2.json | wc -c
delta-pack encode-diff schema.yml -t GameState --old state1.json --new state2.json | wc -c
```

## Exit Codes

| Code | Meaning                                                        |
| ---- | -------------------------------------------------------------- |
| 0    | Success                                                        |
| 1    | Error (invalid arguments, schema error, data validation error) |

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run CLI directly
bun src/index.ts help
```
