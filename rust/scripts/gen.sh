#!/bin/bash
# Generate delta-pack Rust code for example schemas

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLES_DIR="$SCRIPT_DIR/../../examples"
GENERATED_DIR="$SCRIPT_DIR/../generated/examples"

mkdir -p "$GENERATED_DIR"

# Generate Rust code for each example
for example in Primitives User GameState Test; do
    schema_yml="$EXAMPLES_DIR/$example/schema.yml"

    if [ -f "$schema_yml" ]; then
        # Convert to snake_case
        case "$example" in
            "GameState") example_lower="game_state" ;;
            *) example_lower=$(echo "$example" | tr '[:upper:]' '[:lower:]') ;;
        esac

        echo "Generating $example -> $example_lower.rs..."
        npx --no delta-pack generate "$schema_yml" -l rust > "$GENERATED_DIR/${example_lower}.rs"
    fi
done

# Generate mod.rs
cat > "$GENERATED_DIR/mod.rs" << 'EOF'
pub mod game_state;
pub mod primitives;
pub mod test;
pub mod user;
EOF

echo "Generated files in $GENERATED_DIR"
