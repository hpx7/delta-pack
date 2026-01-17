#!/bin/bash
# Generate delta-pack TypeScript code for example schemas
# Requires: delta-pack CLI installed and in PATH

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."
EXAMPLES_DIR="$ROOT_DIR/../examples"
GENERATED_DIR="$ROOT_DIR/generated/examples"

# Log version with git info if in repo
VERSION="$(delta-pack --version)"
REPO_ROOT="$ROOT_DIR/.."
if [ -d "$REPO_ROOT/.git" ]; then
    GIT_INFO="$(git -C "$REPO_ROOT" rev-parse --short HEAD)"
    if ! git -C "$REPO_ROOT" diff --quiet -- typescript cli 2>/dev/null; then
        GIT_INFO="$GIT_INFO-dirty"
    fi
    VERSION="$VERSION ($GIT_INFO)"
fi
echo "delta-pack version: $VERSION"
echo ""

# Create output directory
rm -rf "$GENERATED_DIR"
mkdir -p "$GENERATED_DIR"

# Generate code for each example
EXAMPLES=""
for example_dir in "$EXAMPLES_DIR"/*/; do
    example_name=$(basename "$example_dir")
    schema_yml="$example_dir/schema.yml"

    if [ -f "$schema_yml" ]; then
        echo "Generating $example_name..."
        delta-pack generate "$schema_yml" -l typescript > "$GENERATED_DIR/${example_name}.ts"
        EXAMPLES="$EXAMPLES $example_name"
    fi
done

# Generate index.ts
echo "Generating index.ts..."
INDEX_FILE="$GENERATED_DIR/index.ts"
> "$INDEX_FILE"
for example_name in $EXAMPLES; do
    echo "export { $example_name } from \"./${example_name}.js\";" >> "$INDEX_FILE"
done

# Generate test schema
TEST_SCHEMA="$ROOT_DIR/test/schema.yml"
if [ -f "$TEST_SCHEMA" ]; then
    echo "Generating test/generated-schema.ts..."
    delta-pack generate "$TEST_SCHEMA" -l typescript > "$ROOT_DIR/test/generated-schema.ts"
fi

echo ""
echo "Generated TypeScript code in $GENERATED_DIR"
