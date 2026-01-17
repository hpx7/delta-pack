#!/bin/bash
# Generate delta-pack C# code for example schemas
# Requires: delta-pack CLI installed and in PATH

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/../../examples"
GENERATED_DIR="$SCRIPT_DIR/../generated/examples"

# Log version with git info if in repo
VERSION="$(delta-pack --version)"
ROOT_DIR="$SCRIPT_DIR/../.."
if [ -d "$ROOT_DIR/.git" ]; then
    GIT_INFO="$(git -C "$ROOT_DIR" rev-parse --short HEAD)"
    if ! git -C "$ROOT_DIR" diff --quiet -- typescript cli 2>/dev/null; then
        GIT_INFO="$GIT_INFO-dirty"
    fi
    VERSION="$VERSION ($GIT_INFO)"
fi
echo "delta-pack version: $VERSION"
echo ""

rm -rf "$GENERATED_DIR"
mkdir -p "$GENERATED_DIR"

# Generate one file per example
for example in Primitives User GameState Test; do
    schema_yml="$EXAMPLES_DIR/$example/schema.yml"

    if [ -f "$schema_yml" ]; then
        echo "Generating $example.cs..."
        delta-pack generate "$schema_yml" -l csharp -n Generated.Examples > "$GENERATED_DIR/${example}.cs"
    fi
done

# Generate test schema
TEST_SCHEMA="$SCRIPT_DIR/../tests/schema.yml"
if [ -f "$TEST_SCHEMA" ]; then
    echo "Generating tests/GeneratedSchema.cs..."
    delta-pack generate "$TEST_SCHEMA" -l csharp -n Generated > "$SCRIPT_DIR/../tests/GeneratedSchema.cs"
fi

echo ""
echo "Generated C# code in $GENERATED_DIR"
