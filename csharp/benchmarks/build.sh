#!/bin/bash
# Build script to generate C# code from example schemas

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/../../examples"
GENERATED_DIR="$SCRIPT_DIR/Generated"

# Clean and recreate generated directory
rm -rf "$GENERATED_DIR"
mkdir -p "$GENERATED_DIR/DeltaPack"
mkdir -p "$GENERATED_DIR/Protobuf"

# Generate C# code for each example
for example_dir in "$EXAMPLES_DIR"/*/; do
    example_name=$(basename "$example_dir")
    schema_yml="$example_dir/schema.yml"
    schema_proto="$example_dir/schema.proto"

    if [ -f "$schema_yml" ]; then
        echo "Generating DeltaPack $example_name..."
        delta-pack generate "$schema_yml" -l csharp -n "${example_name}Gen" -o "$GENERATED_DIR/DeltaPack/${example_name}.cs"
    fi

    if [ -f "$schema_proto" ]; then
        echo "Generating Protobuf $example_name..."
        protoc --proto_path="$example_dir" --csharp_out="$GENERATED_DIR/Protobuf" "$schema_proto"
        mv "$GENERATED_DIR/Protobuf/Schema.cs" "$GENERATED_DIR/Protobuf/${example_name}.g.cs"
    fi
done

echo "Generated files in $GENERATED_DIR"
