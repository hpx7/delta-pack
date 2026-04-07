# Rust Performance Benchmarks

Performance comparison of DeltaPack against serde_json and rmp-serde (MessagePack).

## Running

```bash
# From rust directory
benchmarks/build.sh                    # Generate code
cargo run --release -p delta-pack-benchmarks  # Run all benchmarks

# Run specific benchmarks (case-insensitive, partial match)
cargo run --release -p delta-pack-benchmarks -- primitives
cargo run --release -p delta-pack-benchmarks -- gamestate user
```

## Results (codegen)

### Encoding Speed (ops/s)

<img src="charts/encode.svg" alt="Encoding Speed Comparison">

### Decoding Speed (ops/s)

<img src="charts/decode.svg" alt="Decoding Speed Comparison">
