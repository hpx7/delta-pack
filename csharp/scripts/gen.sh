#!/bin/bash
# Generate delta-pack C# code for example schemas

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/../../examples"
GENERATED_DIR="$SCRIPT_DIR/../generated/examples"

mkdir -p "$GENERATED_DIR"

# Generate combined file with all examples
OUTPUT_FILE="$GENERATED_DIR/Examples.cs"

{
    echo '// Auto-generated from example schemas - do not edit'
    echo '#nullable enable'
    echo 'using System.Linq;'
    echo ''
    echo 'namespace Generated.Examples'
    echo '{'

    for example in Primitives User GameState Test; do
        echo "    // === $example ==="
        # Strip header (lines 1-5) and footer (closing brace)
        npx --no delta-pack generate "$EXAMPLES_DIR/$example/schema.yml" -l csharp -n Generated.Examples | tail -n +6 | sed '$ d'
        echo ''
    done

    echo '}'
} > "$OUTPUT_FILE"

echo "Generated $OUTPUT_FILE"
