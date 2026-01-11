using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Nodes;
using DeltaPack;
using Google.Protobuf;
using MessagePack;

namespace DeltaPack.Benchmarks;

public class Program
{
    private const int WarmupIterations = 1000;
    private const int BenchmarkDurationMs = 500;

    public static void Main(string[] args)
    {
        // Parse flags
        bool interpreterMode = args.Contains("--interpreter", StringComparer.OrdinalIgnoreCase);
        var filter = args.Where(a => !a.StartsWith("--")).ToArray();

        var examplesDir = Path.Combine("..", "examples");
        var deltaPackOps = interpreterMode
            ? CreateInterpreterOps(examplesDir)
            : CreateCodegenOps();

        var examples = LoadExamples(examplesDir, deltaPackOps, interpreterMode);

        if (filter.Length > 0)
        {
            examples = examples.Where(e => filter.Any(f => e.Name.Contains(f, StringComparison.OrdinalIgnoreCase))).ToList();
            if (examples.Count == 0)
            {
                Console.Error.WriteLine($"No examples match filter: {string.Join(", ", filter)}");
                Console.Error.WriteLine($"Available: {string.Join(", ", deltaPackOps.Keys)}");
                Environment.Exit(1);
            }
        }

        var mode = interpreterMode ? "INTERPRETER" : "CODEGEN";
        Console.WriteLine($"Running benchmarks in {mode} mode\n");

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
                ["Protobuf"] = new(),
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
                Warmup(() => state.ProtobufMessage.ToByteArray());
                results["Protobuf"].Add(MeasureOpsPerSecond(() => state.ProtobufMessage.ToByteArray()));
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
                ["Protobuf"] = new(),
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
                Warmup(() => state.ProtobufDecode(state.ProtobufEncoded));
                results["Protobuf"].Add(MeasureOpsPerSecond(() => state.ProtobufDecode(state.ProtobufEncoded)));
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

    static Dictionary<string, DeltaPackOps> CreateCodegenOps()
    {
        return new Dictionary<string, DeltaPackOps>
        {
            ["GameState"] = new(
                Generated.Examples.GameState.FromJson,
                obj => Generated.Examples.GameState.ToJson((Generated.Examples.GameState)obj!),
                obj => Generated.Examples.GameState.Encode((Generated.Examples.GameState)obj!),
                buf => Generated.Examples.GameState.Decode(buf),
                (a, b) => Generated.Examples.GameState.Equals((Generated.Examples.GameState)a!, (Generated.Examples.GameState)b!)),
            ["Primitives"] = new(
                Generated.Examples.Primitives.FromJson,
                obj => Generated.Examples.Primitives.ToJson((Generated.Examples.Primitives)obj!),
                obj => Generated.Examples.Primitives.Encode((Generated.Examples.Primitives)obj!),
                buf => Generated.Examples.Primitives.Decode(buf),
                (a, b) => Generated.Examples.Primitives.Equals((Generated.Examples.Primitives)a!, (Generated.Examples.Primitives)b!)),
            ["Test"] = new(
                Generated.Examples.Test.FromJson,
                obj => Generated.Examples.Test.ToJson((Generated.Examples.Test)obj!),
                obj => Generated.Examples.Test.Encode((Generated.Examples.Test)obj!),
                buf => Generated.Examples.Test.Decode(buf),
                (a, b) => Generated.Examples.Test.Equals((Generated.Examples.Test)a!, (Generated.Examples.Test)b!)),
            ["User"] = new(
                Generated.Examples.User.FromJson,
                obj => Generated.Examples.User.ToJson((Generated.Examples.User)obj!),
                obj => Generated.Examples.User.Encode((Generated.Examples.User)obj!),
                buf => Generated.Examples.User.Decode(buf),
                (a, b) => Generated.Examples.User.Equals((Generated.Examples.User)a!, (Generated.Examples.User)b!)),
        };
    }

    static Dictionary<string, DeltaPackOps> CreateInterpreterOps(string examplesDir)
    {
        var ops = new Dictionary<string, DeltaPackOps>();
        foreach (var dir in Directory.GetDirectories(examplesDir))
        {
            var schemaPath = Path.Combine(dir, "schema.yml");
            if (!File.Exists(schemaPath)) continue;

            var name = Path.GetFileName(dir);
            var yamlContent = File.ReadAllText(schemaPath);
            var schema = Parser.ParseSchemaYml(yamlContent);

            if (schema.ContainsKey(name))
            {
                var api = Interpreter.Load<object?>(schema, name);
                ops[name] = new DeltaPackOps(
                    api.FromJson,
                    obj => JsonSerializer.Deserialize<JsonObject>(api.ToJson(obj))!,
                    api.Encode,
                    api.Decode,
                    api.Equals);
            }
        }
        return ops;
    }

    static (Func<JsonParser, string, IMessage> parseJson, Func<byte[], IMessage> decode)? GetProtoParser(string name)
    {
        return name switch
        {
            "GameState" => ((jp, json) => jp.Parse<Gamestate.GameState>(json), bytes => Gamestate.GameState.Parser.ParseFrom(bytes)),
            "Primitives" => ((jp, json) => jp.Parse<Primitives.Primitives>(json), bytes => Primitives.Primitives.Parser.ParseFrom(bytes)),
            "Test" => ((jp, json) => jp.Parse<Test.Test>(json), bytes => Test.Test.Parser.ParseFrom(bytes)),
            "User" => ((jp, json) => jp.Parse<User.User>(json), bytes => User.User.Parser.ParseFrom(bytes)),
            _ => null
        };
    }

    static List<Example> LoadExamples(string examplesDir, Dictionary<string, DeltaPackOps> deltaPackOps, bool interpreterMode)
    {
        var examples = new List<Example>();
        var jsonParser = new JsonParser(JsonParser.Settings.Default.WithIgnoreUnknownFields(true));

        foreach (var (name, ops) in deltaPackOps)
        {
            var protoInfo = GetProtoParser(name);
            examples.Add(LoadExample(name, examplesDir, jsonParser, ops, protoInfo, interpreterMode));
        }

        return examples;
    }

    static Example LoadExample(
        string name,
        string examplesDir,
        JsonParser jsonParser,
        DeltaPackOps ops,
        (Func<JsonParser, string, IMessage> parseJson, Func<byte[], IMessage> decode)? protoInfo,
        bool interpreterMode)
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
            var typed = ops.FromJson(doc.RootElement);
            var jsonState = ops.ToJson(typed);
            var deltaPackEncoded = ops.Encode(typed);

            // Verify DeltaPack round-trip
            var deltaPackDecoded = ops.Decode(deltaPackEncoded);
            if (!ops.AreEqual(typed, deltaPackDecoded))
            {
                throw new Exception($"DeltaPack round-trip failed for {name}: {Path.GetFileName(file)}");
            }

            // MessagePack serialization
            byte[] msgPackEncoded = MessagePackSerializer.Typeless.Serialize(typed);
            if (!interpreterMode)
            {
                // Verify round-trip in codegen mode only (interpreter produces different object structure)
                var msgPackDecoded = MessagePackSerializer.Typeless.Deserialize(msgPackEncoded);
                if (!ops.AreEqual(typed, msgPackDecoded))
                {
                    throw new Exception($"MessagePack round-trip failed for {name}: {Path.GetFileName(file)}");
                }
            }

            // Parse and verify Protobuf round-trip (always uses codegen)
            IMessage? protoMessage = null;
            byte[] protoEncoded = [];
            Func<byte[], IMessage>? protoDecode = null;
            if (protoInfo != null)
            {
                protoMessage = protoInfo.Value.parseJson(jsonParser, json);
                protoEncoded = protoMessage.ToByteArray();
                var protoDecoded = protoInfo.Value.decode(protoEncoded);
                if (!protoMessage.Equals(protoDecoded))
                {
                    throw new Exception($"Protobuf round-trip failed for {name}: {Path.GetFileName(file)}");
                }
                protoDecode = protoInfo.Value.decode;
            }

            states.Add(new StateData(
                TypedState: typed!,
                JsonState: jsonState,
                JsonEncoded: JsonSerializer.SerializeToUtf8Bytes(jsonState),
                MsgPackEncoded: msgPackEncoded,
                ProtobufEncoded: protoEncoded,
                DeltaPackEncoded: deltaPackEncoded,
                DeltaPackEncode: ops.Encode,
                DeltaPackDecode: buf => ops.Decode(buf)!,
                ProtobufMessage: protoMessage!,
                ProtobufDecode: protoDecode ?? (bytes => null!)));
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
    byte[] ProtobufEncoded,
    byte[] DeltaPackEncoded,
    Func<object, byte[]> DeltaPackEncode,
    Func<byte[], object> DeltaPackDecode,
    IMessage ProtobufMessage,
    Func<byte[], IMessage> ProtobufDecode);

record DeltaPackOps(
    Func<JsonElement, object?> FromJson,
    Func<object?, JsonObject> ToJson,
    Func<object?, byte[]> Encode,
    Func<byte[], object?> Decode,
    Func<object?, object?, bool> AreEqual);
