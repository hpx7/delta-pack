#!/bin/bash
# Generate delta-pack C# code for example schemas

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/../../examples"
GENERATED_DIR="$SCRIPT_DIR/../generated/examples"

rm -rf "$GENERATED_DIR"
mkdir -p "$GENERATED_DIR"

# Generate one file per example
for example in Primitives User GameState Test; do
    schema_yml="$EXAMPLES_DIR/$example/schema.yml"

    if [ -f "$schema_yml" ]; then
        echo "Generating $example.cs..."
        npx --no delta-pack generate "$schema_yml" -l csharp -n Generated.Examples > "$GENERATED_DIR/${example}.cs"
    fi
done

echo "Generated files in $GENERATED_DIR"
