using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Nodes;
using MessagePack;

namespace DeltaPack.Benchmarks;

public class Program
{
    private const int WarmupIterations = 1000;
    private const int BenchmarkDurationMs = 500;

    public static void Main(string[] args)
    {
        var examples = LoadExamples();

        // Burn-in to warm up measurement infrastructure (Stopwatch, Action delegates, etc.)
        Console.Error.WriteLine("Warming up...");
        var burnIn = examples[0].States[0];
        Warmup(() => JsonSerializer.SerializeToUtf8Bytes(burnIn.JsonState));
        MeasureOpsPerSecond(() => JsonSerializer.SerializeToUtf8Bytes(burnIn.JsonState));
        Warmup(() => MessagePackSerializer.Typeless.Serialize(burnIn.TypedState));
        MeasureOpsPerSecond(() => MessagePackSerializer.Typeless.Serialize(burnIn.TypedState));
        Warmup(() => burnIn.DeltaPackEncode(burnIn.TypedState));
        MeasureOpsPerSecond(() => burnIn.DeltaPackEncode(burnIn.TypedState));
        Warmup(() => JsonDocument.Parse(burnIn.JsonEncoded));
        MeasureOpsPerSecond(() => JsonDocument.Parse(burnIn.JsonEncoded));
        Warmup(() => MessagePackSerializer.Typeless.Deserialize(burnIn.MsgPackEncoded));
        MeasureOpsPerSecond(() => MessagePackSerializer.Typeless.Deserialize(burnIn.MsgPackEncoded));
        Warmup(() => burnIn.DeltaPackDecode(burnIn.DeltaPackEncoded));
        MeasureOpsPerSecond(() => burnIn.DeltaPackDecode(burnIn.DeltaPackEncoded));

        Console.Error.WriteLine("Running benchmarks...\n");

        Console.WriteLine("## Encoding Speed Comparison (ops/s)\n");
        Console.WriteLine("Higher is better. The multiplier shows how much slower each format is compared to the fastest.\n");
        RunEncodeBenchmarks(examples);

        Console.WriteLine("\n## Decoding Speed Comparison (ops/s)\n");
        Console.WriteLine("Higher is better. The multiplier shows how much slower each format is compared to the fastest.\n");
        RunDecodeBenchmarks(examples);
    }

    static void RunEncodeBenchmarks(List<Example> examples)
    {
        foreach (var example in examples)
        {
            Console.WriteLine($"### {example.Name}\n");

            var results = new Dictionary<string, List<double>>
            {
                ["JSON"] = new(),
                ["MessagePack"] = new(),
                ["DeltaPack"] = new()
            };

            foreach (var state in example.States)
            {
                Warmup(() => JsonSerializer.SerializeToUtf8Bytes(state.JsonState));
                results["JSON"].Add(MeasureOpsPerSecond(() => JsonSerializer.SerializeToUtf8Bytes(state.JsonState)));
            }
            foreach (var state in example.States)
            {
                Warmup(() => MessagePackSerializer.Typeless.Serialize(state.TypedState));
                results["MessagePack"].Add(MeasureOpsPerSecond(() => MessagePackSerializer.Typeless.Serialize(state.TypedState)));
            }
            foreach (var state in example.States)
            {
                Warmup(() => state.DeltaPackEncode(state.TypedState));
                results["DeltaPack"].Add(MeasureOpsPerSecond(() => state.DeltaPackEncode(state.TypedState)));
            }

            PrintTable(example.States.Count, results);
            Console.WriteLine();
        }
    }

    static void RunDecodeBenchmarks(List<Example> examples)
    {
        foreach (var example in examples)
        {
            Console.WriteLine($"### {example.Name}\n");

            var results = new Dictionary<string, List<double>>
            {
                ["JSON"] = new(),
                ["MessagePack"] = new(),
                ["DeltaPack"] = new()
            };

            foreach (var state in example.States)
            {
                Warmup(() => JsonDocument.Parse(state.JsonEncoded));
                results["JSON"].Add(MeasureOpsPerSecond(() => JsonDocument.Parse(state.JsonEncoded)));
            }
            foreach (var state in example.States)
            {
                Warmup(() => MessagePackSerializer.Typeless.Deserialize(state.MsgPackEncoded));
                results["MessagePack"].Add(MeasureOpsPerSecond(() => MessagePackSerializer.Typeless.Deserialize(state.MsgPackEncoded)));
            }
            foreach (var state in example.States)
            {
                Warmup(() => state.DeltaPackDecode(state.DeltaPackEncoded));
                results["DeltaPack"].Add(MeasureOpsPerSecond(() => state.DeltaPackDecode(state.DeltaPackEncoded)));
            }

            PrintTable(example.States.Count, results);
            Console.WriteLine();
        }
    }

    static void Warmup(Action action)
    {
        for (int i = 0; i < WarmupIterations; i++)
        {
            action();
        }
    }

    static double MeasureOpsPerSecond(Action action)
    {
        var sw = Stopwatch.StartNew();
        long ops = 0;

        while (sw.ElapsedMilliseconds < BenchmarkDurationMs)
        {
            action();
            ops++;
        }

        sw.Stop();
        return ops / (sw.Elapsed.TotalSeconds);
    }

    static void PrintTable(int stateCount, Dictionary<string, List<double>> results)
    {
        // Calculate max ops per state for multiplier calculation
        var maxOps = new double[stateCount];
        for (int i = 0; i < stateCount; i++)
        {
            maxOps[i] = results.Values.Max(r => r[i]);
        }

        // Build header
        var headers = new List<string> { "Format" };
        for (int i = 0; i < stateCount; i++)
            headers.Add($"State{i + 1}");

        // Build rows
        var rows = new List<List<string>>();
        foreach (var (format, ops) in results)
        {
            var row = new List<string> { format };
            for (int i = 0; i < stateCount; i++)
            {
                var multiplier = maxOps[i] / ops[i];
                row.Add($"{FormatOps(ops[i])} ({multiplier:F1}x)");
            }
            rows.Add(row);
        }

        // Calculate column widths
        var colWidths = headers.Select((h, i) =>
            Math.Max(h.Length, rows.Max(r => r[i].Length))).ToArray();

        // Print table
        Console.WriteLine("| " + string.Join(" | ", headers.Select((h, i) => h.PadRight(colWidths[i]))) + " |");
        Console.WriteLine("| " + string.Join(" | ", colWidths.Select(w => new string('-', w))) + " |");
        foreach (var row in rows)
        {
            Console.WriteLine("| " + string.Join(" | ", row.Select((c, i) => c.PadRight(colWidths[i]))) + " |");
        }
    }

    static string FormatOps(double ops)
    {
        if (ops >= 1_000_000)
            return $"{ops / 1_000_000:F1}M";
        if (ops >= 1_000)
            return $"{ops / 1_000:F1}K";
        return $"{ops:F0}";
    }

    static List<Example> LoadExamples()
    {
        var examplesDir = Path.Combine("..", "examples");
        var examples = new List<Example>();

        // GameState
        examples.Add(LoadExample<GameStateGen.GameState>(
            "GameState", examplesDir,
            GameStateGen.GameState.FromJson,
            GameStateGen.GameState.ToJson,
            GameStateGen.GameState.Encode,
            GameStateGen.GameState.Decode,
            GameStateGen.GameState.Equals));

        // Primitives
        examples.Add(LoadExample<PrimitivesGen.Primitives>(
            "Primitives", examplesDir,
            PrimitivesGen.Primitives.FromJson,
            PrimitivesGen.Primitives.ToJson,
            PrimitivesGen.Primitives.Encode,
            PrimitivesGen.Primitives.Decode,
            PrimitivesGen.Primitives.Equals));

        // Test
        examples.Add(LoadExample<TestGen.Test>(
            "Test", examplesDir,
            TestGen.Test.FromJson,
            TestGen.Test.ToJson,
            TestGen.Test.Encode,
            TestGen.Test.Decode,
            TestGen.Test.Equals));

        // User
        examples.Add(LoadExample<UserGen.User>(
            "User", examplesDir,
            UserGen.User.FromJson,
            UserGen.User.ToJson,
            UserGen.User.Encode,
            UserGen.User.Decode,
            UserGen.User.Equals));

        return examples;
    }

    static Example LoadExample<T>(
        string name,
        string examplesDir,
        Func<JsonElement, T> fromJson,
        Func<T, JsonObject> toJson,
        Func<T, byte[]> encode,
        Func<byte[], T> decode,
        Func<T, T, bool> equals)
    {
        var exampleDir = Path.Combine(examplesDir, name);
        var stateFiles = Directory.GetFiles(exampleDir, "state*.json")
            .OrderBy(f => int.Parse(Path.GetFileNameWithoutExtension(f).Replace("state", "")))
            .ToList();

        var states = new List<StateData>();
        foreach (var file in stateFiles)
        {
            var json = File.ReadAllText(file);
            var doc = JsonDocument.Parse(json);
            var typed = fromJson(doc.RootElement);
            var jsonState = toJson(typed);
            var deltaPackEncoded = encode(typed);

            // Verify DeltaPack round-trip
            var deltaPackDecoded = decode(deltaPackEncoded);
            if (!equals(typed, deltaPackDecoded))
            {
                throw new Exception($"DeltaPack round-trip failed for {name}: {Path.GetFileName(file)}");
            }

            // Verify MessagePack round-trip (direct serialization of typed state)
            var msgPackEncoded = MessagePackSerializer.Typeless.Serialize(typed);
            var msgPackDecoded = (T)MessagePackSerializer.Typeless.Deserialize(msgPackEncoded)!;
            if (!equals(typed, msgPackDecoded))
            {
                throw new Exception($"MessagePack round-trip failed for {name}: {Path.GetFileName(file)}");
            }

            states.Add(new StateData(
                TypedState: typed!,
                JsonState: jsonState,
                JsonEncoded: JsonSerializer.SerializeToUtf8Bytes(jsonState),
                MsgPackEncoded: msgPackEncoded,
                DeltaPackEncoded: deltaPackEncoded,
                DeltaPackEncode: obj => encode((T)obj),
                DeltaPackDecode: bytes => decode(bytes)!));
        }

        return new Example(name, states);
    }
}

record Example(string Name, List<StateData> States);

record StateData(
    object TypedState,
    JsonObject JsonState,
    byte[] JsonEncoded,
    byte[] MsgPackEncoded,
    byte[] DeltaPackEncoded,
    Func<object, byte[]> DeltaPackEncode,
    Func<byte[], object> DeltaPackDecode);
