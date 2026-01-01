#!/bin/bash
# Build script to generate C# code from example schemas

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/../../examples"
GENERATED_DIR="$SCRIPT_DIR/Generated"

# Clean and recreate generated directory
rm -rf "$GENERATED_DIR"
mkdir -p "$GENERATED_DIR"

# Generate C# code for each example using delta-pack CLI
for example_dir in "$EXAMPLES_DIR"/*/; do
    example_name=$(basename "$example_dir")
    schema_path="$example_dir/schema.yml"

    if [ -f "$schema_path" ]; then
        echo "Generating $example_name..."
        delta-pack generate "$schema_path" -l csharp -n "${example_name}Gen" -o "$GENERATED_DIR/${example_name}.cs"
    fi
done

echo "Generated files in $GENERATED_DIR"
