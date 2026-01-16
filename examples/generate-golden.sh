#!/bin/bash
# Generate golden bytes for conformance testing
# Requires: delta-pack CLI installed and in PATH

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Log version with git info if in repo
VERSION="$(delta-pack --version)"
ROOT_DIR="$SCRIPT_DIR/.."
if [ -d "$ROOT_DIR/.git" ]; then
    GIT_INFO="$(git -C "$ROOT_DIR" rev-parse --short HEAD)"
    if ! git -C "$ROOT_DIR" diff --quiet -- typescript cli 2>/dev/null; then
        GIT_INFO="$GIT_INFO-dirty"
    fi
    VERSION="$VERSION ($GIT_INFO)"
fi
echo "delta-pack version: $VERSION"
echo ""

generate_example() {
    local example="$1"
    shift
    local states=("$@")

    local example_dir="$SCRIPT_DIR/$example"
    local schema="$example_dir/schema.yml"

    echo "Processing $example..."

    # Generate full encodes (snapshots)
    for state in "${states[@]}"; do
        local input="$example_dir/${state}.json"
        local output="$example_dir/${state}.snapshot.bin"
        echo "  Encoding $state.json -> $state.snapshot.bin"
        delta-pack encode "$schema" -t "$example" -i "$input" -o "$output"
    done

    # Generate diff encodes (consecutive state pairs)
    local i=0
    while [ $i -lt $((${#states[@]} - 1)) ]; do
        local old_state="${states[$i]}"
        local new_state="${states[$((i + 1))]}"
        local old_file="$example_dir/${old_state}.json"
        local new_file="$example_dir/${new_state}.json"
        local output="$example_dir/${old_state}_${new_state}.diff.bin"
        echo "  Encoding diff $old_state -> $new_state"
        delta-pack encode-diff "$schema" -t "$example" --old "$old_file" --new "$new_file" -o "$output"
        i=$((i + 1))
    done
}

generate_example "Primitives" "state1" "state2"
generate_example "User" "state1" "state2"
generate_example "GameState" "state1" "state2" "state3" "state4" "state5" "state6"
generate_example "Test" "state1"

echo "Golden bytes generated successfully!"
