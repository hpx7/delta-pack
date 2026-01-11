#!/bin/bash
# Build script to generate code for benchmarks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/../../examples"
GENERATED_DIR="$SCRIPT_DIR/Generated"

# Generate shared delta-pack code
"$SCRIPT_DIR/../scripts/gen.sh"

# Generate protobuf code
rm -rf "$GENERATED_DIR/Protobuf"
mkdir -p "$GENERATED_DIR/Protobuf"

for example_dir in "$EXAMPLES_DIR"/*/; do
    example_name=$(basename "$example_dir")
    schema_proto="$example_dir/schema.proto"

    if [ -f "$schema_proto" ]; then
        echo "Generating Protobuf $example_name..."
        protoc --proto_path="$example_dir" --csharp_out="$GENERATED_DIR/Protobuf" "$schema_proto"
        mv "$GENERATED_DIR/Protobuf/Schema.cs" "$GENERATED_DIR/Protobuf/${example_name}.g.cs"
    fi
done

echo "Generated protobuf files in $GENERATED_DIR/Protobuf"
