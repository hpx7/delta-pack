# C# Performance Benchmarks

Performance comparison of DeltaPack against System.Text.Json, MessagePack-CSharp, Protobuf, and Apache.Avro.

## Running

```bash
# From csharp directory
benchmarks/build.sh                         # Generate code
dotnet run -c Release --project benchmarks  # Run all benchmarks

# Run specific benchmarks (case-insensitive, partial match)
dotnet run -c Release --project benchmarks Primitives
dotnet run -c Release --project benchmarks GameState User

# Save charts to benchmarks/charts/
dotnet run -c Release --project benchmarks -- --save
```

## Results

### Encoding Speed (ops/s)

<img src="charts/encode.svg" alt="Encoding Speed Comparison">

### Decoding Speed (ops/s)

<img src="charts/decode.svg" alt="Decoding Speed Comparison">
