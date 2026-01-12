#!/bin/bash
# Build script for Rust benchmarks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Generate shared delta-pack code
"$SCRIPT_DIR/../scripts/gen.sh"

echo "Benchmark build complete"
