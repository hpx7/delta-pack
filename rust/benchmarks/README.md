# Rust Performance Benchmarks

Performance comparison of DeltaPack against serde_json, rmp-serde (MessagePack), and prost (Protobuf).

## Running

```bash
# From rust directory
benchmarks/build.sh                    # Generate code
cargo run --release -p delta-pack-benchmarks  # Run all benchmarks

# Run specific benchmarks (case-insensitive, partial match)
cargo run --release -p delta-pack-benchmarks -- primitives
cargo run --release -p delta-pack-benchmarks -- gamestate user

# Save charts to benchmarks/charts/
cargo run --release -p delta-pack-benchmarks -- --save
```

## Results (codegen)

### Encoding Speed (ops/s)

<img src="charts/encode.svg" alt="Encoding Speed Comparison">

### Decoding Speed (ops/s)

<img src="charts/decode.svg" alt="Decoding Speed Comparison">
