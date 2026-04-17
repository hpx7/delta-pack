// Rust benchmarks comparing JSON, MessagePack, and DeltaPack
// Similar to TypeScript and C# benchmarks

#[cfg(feature = "mimalloc")]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

mod generated;

#[allow(warnings)]
mod protobuf {
    pub mod primitives {
        include!(concat!(env!("OUT_DIR"), "/primitives.rs"));
        include!(concat!(env!("OUT_DIR"), "/primitives.serde.rs"));
    }
    pub mod test {
        include!(concat!(env!("OUT_DIR"), "/test.rs"));
        include!(concat!(env!("OUT_DIR"), "/test.serde.rs"));
    }
    pub mod user {
        include!(concat!(env!("OUT_DIR"), "/user.rs"));
        include!(concat!(env!("OUT_DIR"), "/user.serde.rs"));
    }
    pub mod gamestate {
        include!(concat!(env!("OUT_DIR"), "/gamestate.rs"));
        include!(concat!(env!("OUT_DIR"), "/gamestate.serde.rs"));
    }
}

#[allow(warnings)]
mod avro {
    pub mod primitives {
        include!(concat!(env!("OUT_DIR"), "/avro_primitives.rs"));
    }
    pub mod test {
        include!(concat!(env!("OUT_DIR"), "/avro_test.rs"));
    }
    pub mod user {
        include!(concat!(env!("OUT_DIR"), "/avro_user.rs"));
    }
    pub mod gamestate {
        include!(concat!(env!("OUT_DIR"), "/avro_gamestate.rs"));
    }
}

use prost::Message;
use serde::{de::DeserializeOwned, Serialize};
use serde_avro_fast::{
    from_datum_slice, ser::SerializerConfig, to_datum_vec, Schema as AvroSchema,
};
use std::cell::RefCell;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::time::{Duration, Instant};

const WARMUP_ITERATIONS: usize = 1000;
const BENCHMARK_DURATION_MS: u64 = 500;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let save = args.iter().any(|a| a == "--save");
    let filter: Vec<&str> = args
        .iter()
        .skip(1)
        .filter(|a| !a.starts_with("--"))
        .map(|s| s.as_str())
        .collect();

    let examples_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .join("examples");

    let mut examples = load_examples(&examples_dir);

    if !filter.is_empty() {
        examples.retain(|e| {
            filter
                .iter()
                .any(|f| e.name.to_lowercase().contains(&f.to_lowercase()))
        });
        if examples.is_empty() {
            eprintln!("No examples match filter: {}", filter.join(", "));
            eprintln!("Available: Primitives, Test, User, GameState");
            std::process::exit(1);
        }
    }

    println!("Warming up...");
    global_warmup(&examples);

    println!("\n## Encoding Speed Comparison (ops/s)\n");
    println!("Higher is better. The multiplier shows how much slower each format is compared to the fastest.\n");
    let encode_groups = run_encode_benchmarks(&examples);

    println!("\n## Decoding Speed Comparison (ops/s)\n");
    println!("Higher is better. The multiplier shows how much slower each format is compared to the fastest.\n");
    let decode_groups = run_decode_benchmarks(&examples);

    if save {
        let charts_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("charts");
        fs::create_dir_all(&charts_dir).unwrap();
        fs::write(
            charts_dir.join("encode.svg"),
            generate_bar_chart_svg("Encoding Speed (ops/s)", &encode_groups),
        )
        .unwrap();
        fs::write(
            charts_dir.join("decode.svg"),
            generate_bar_chart_svg("Decoding Speed (ops/s)", &decode_groups),
        )
        .unwrap();
        println!(
            "\nCharts written to benchmarks/charts/encode.svg and benchmarks/charts/decode.svg"
        );
    }
}

fn global_warmup(examples: &[Example]) {
    for example in examples {
        for state in &example.states {
            // Warmup encode
            for _ in 0..WARMUP_ITERATIONS {
                let _ = serde_json::to_vec(&state.json_value);
                let _ = rmp_serde::to_vec(&state.json_value);
                let _ = (state.protobuf_encode)();
                let _ = (state.avro_encode)();
                let _ = (state.deltapack_encode)();
            }
            // Warmup decode
            for _ in 0..WARMUP_ITERATIONS {
                let _: serde_json::Value = serde_json::from_slice(&state.json_encoded).unwrap();
                let _: serde_json::Value = rmp_serde::from_slice(&state.msgpack_encoded).unwrap();
                let _ = (state.protobuf_decode)();
                let _ = (state.avro_decode)();
                let _ = (state.deltapack_decode)();
            }
        }
    }
}

fn run_encode_benchmarks(examples: &[Example]) -> Vec<ChartGroup> {
    let mut groups = Vec::new();

    for example in examples {
        println!("### {}\n", example.name);

        let mut results: HashMap<&str, Vec<f64>> = HashMap::new();
        results.insert("JSON", Vec::new());
        results.insert("MessagePack", Vec::new());
        results.insert("Protobuf", Vec::new());
        results.insert("Avro", Vec::new());
        results.insert("DeltaPack", Vec::new());

        for state in &example.states {
            let json_value = state.json_value.clone();
            results
                .get_mut("JSON")
                .unwrap()
                .push(measure_ops_per_second(|| {
                    let _ = serde_json::to_vec(&json_value);
                }));
        }
        for state in &example.states {
            let json_value = state.json_value.clone();
            results
                .get_mut("MessagePack")
                .unwrap()
                .push(measure_ops_per_second(|| {
                    let _ = rmp_serde::to_vec(&json_value);
                }));
        }
        for state in &example.states {
            let encode_fn = &state.protobuf_encode;
            results
                .get_mut("Protobuf")
                .unwrap()
                .push(measure_ops_per_second(|| {
                    let _ = encode_fn();
                }));
        }
        for state in &example.states {
            let encode_fn = &state.avro_encode;
            results
                .get_mut("Avro")
                .unwrap()
                .push(measure_ops_per_second(|| {
                    let _ = encode_fn();
                }));
        }
        for state in &example.states {
            let encode_fn = &state.deltapack_encode;
            results
                .get_mut("DeltaPack")
                .unwrap()
                .push(measure_ops_per_second(|| {
                    let _ = encode_fn();
                }));
        }

        print_table(example.states.len(), &results);
        println!();
        collect_chart_groups(&mut groups, &example.name, example.states.len(), &results);
    }

    groups
}

fn run_decode_benchmarks(examples: &[Example]) -> Vec<ChartGroup> {
    let mut groups = Vec::new();

    for example in examples {
        println!("### {}\n", example.name);

        let mut results: HashMap<&str, Vec<f64>> = HashMap::new();
        results.insert("JSON", Vec::new());
        results.insert("MessagePack", Vec::new());
        results.insert("Protobuf", Vec::new());
        results.insert("Avro", Vec::new());
        results.insert("DeltaPack", Vec::new());

        for state in &example.states {
            let json_encoded = state.json_encoded.clone();
            results
                .get_mut("JSON")
                .unwrap()
                .push(measure_ops_per_second(|| {
                    let _: serde_json::Value = serde_json::from_slice(&json_encoded).unwrap();
                }));
        }
        for state in &example.states {
            let msgpack_encoded = state.msgpack_encoded.clone();
            results
                .get_mut("MessagePack")
                .unwrap()
                .push(measure_ops_per_second(|| {
                    let _: serde_json::Value = rmp_serde::from_slice(&msgpack_encoded).unwrap();
                }));
        }
        for state in &example.states {
            let decode_fn = &state.protobuf_decode;
            results
                .get_mut("Protobuf")
                .unwrap()
                .push(measure_ops_per_second(|| {
                    let _ = decode_fn();
                }));
        }
        for state in &example.states {
            let decode_fn = &state.avro_decode;
            results
                .get_mut("Avro")
                .unwrap()
                .push(measure_ops_per_second(|| {
                    let _ = decode_fn();
                }));
        }
        for state in &example.states {
            let decode_fn = &state.deltapack_decode;
            results
                .get_mut("DeltaPack")
                .unwrap()
                .push(measure_ops_per_second(|| {
                    let _ = decode_fn();
                }));
        }

        print_table(example.states.len(), &results);
        println!();
        collect_chart_groups(&mut groups, &example.name, example.states.len(), &results);
    }

    groups
}

fn measure_ops_per_second<F: FnMut()>(mut action: F) -> f64 {
    let start = Instant::now();
    let duration = Duration::from_millis(BENCHMARK_DURATION_MS);
    let mut ops: u64 = 0;

    while start.elapsed() < duration {
        action();
        ops += 1;
    }

    let elapsed = start.elapsed().as_secs_f64();
    ops as f64 / elapsed
}

fn print_table(state_count: usize, results: &HashMap<&str, Vec<f64>>) {
    // Calculate max ops per state for multiplier calculation
    let mut max_ops = vec![0.0f64; state_count];
    for i in 0..state_count {
        for ops in results.values() {
            if ops[i] > max_ops[i] {
                max_ops[i] = ops[i];
            }
        }
    }

    // Build header
    let mut headers = vec!["Format".to_string()];
    for i in 0..state_count {
        headers.push(format!("State{}", i + 1));
    }

    // Build rows (in consistent order)
    let mut rows: Vec<Vec<String>> = Vec::new();
    for format in FORMAT_ORDER {
        if let Some(ops) = results.get(format) {
            let mut row = vec![format.to_string()];
            for i in 0..state_count {
                let multiplier = max_ops[i] / ops[i];
                row.push(format!("{} ({:.1}x)", format_ops(ops[i]), multiplier));
            }
            rows.push(row);
        }
    }

    // Calculate column widths
    let col_widths: Vec<usize> = (0..headers.len())
        .map(|i| {
            let header_len = headers[i].len();
            let max_row_len = rows.iter().map(|r| r[i].len()).max().unwrap_or(0);
            header_len.max(max_row_len)
        })
        .collect();

    // Print table
    print!("|");
    for (i, h) in headers.iter().enumerate() {
        print!(" {:width$} |", h, width = col_widths[i]);
    }
    println!();

    print!("|");
    for w in &col_widths {
        print!(" {} |", "-".repeat(*w));
    }
    println!();

    for row in &rows {
        print!("|");
        for (i, c) in row.iter().enumerate() {
            print!(" {:width$} |", c, width = col_widths[i]);
        }
        println!();
    }
}

fn format_ops(ops: f64) -> String {
    if ops >= 1_000_000.0 {
        format!("{:.1}M", ops / 1_000_000.0)
    } else if ops >= 1_000.0 {
        format!("{:.1}K", ops / 1_000.0)
    } else {
        format!("{:.0}", ops)
    }
}

// ============ Chart Generation ============

const FORMAT_ORDER: &[&str] = &["JSON", "MessagePack", "Protobuf", "Avro", "DeltaPack"];

fn collect_chart_groups(
    groups: &mut Vec<ChartGroup>,
    example_name: &str,
    state_count: usize,
    results: &HashMap<&str, Vec<f64>>,
) {
    for i in 0..state_count {
        let bars: Vec<ChartBar> = FORMAT_ORDER
            .iter()
            .filter_map(|&name| {
                results.get(name).map(|ops| ChartBar {
                    label: name.to_string(),
                    value: ops[i],
                    color: format_color(name).to_string(),
                })
            })
            .collect();
        groups.push(ChartGroup {
            label: format!("{} State{}", example_name, i + 1),
            bars,
        });
    }
}

fn format_color(name: &str) -> &'static str {
    match name {
        "JSON" => "#f59e0b",
        "MessagePack" => "#8b5cf6",
        "Protobuf" => "#3b82f6",
        "Avro" => "#ec4899",
        "DeltaPack" => "#10b981",
        _ => "#999999",
    }
}

struct ChartBar {
    label: String,
    value: f64,
    color: String,
}

struct ChartGroup {
    label: String,
    bars: Vec<ChartBar>,
}

fn escape_xml(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

fn generate_bar_chart_svg(title: &str, groups: &[ChartGroup]) -> String {
    let width = 680;
    let label_width = 130;
    let value_width = 70;
    let bar_area_width = width - label_width - value_width - 24;
    let bar_height = 20;
    let bar_gap = 4;
    let group_header_height = 24;
    let group_gap = 16;
    let title_height = 40;
    let bottom_padding = 12;

    let mut height = title_height;
    for group in groups {
        height += group_header_height;
        height += group.bars.len() as i32 * (bar_height + bar_gap) - bar_gap;
        height += group_gap;
    }
    height += bottom_padding;

    let mut lines = Vec::new();
    lines.push(format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{}\" height=\"{}\" viewBox=\"0 0 {} {}\">",
        width, height, width, height
    ));
    lines.push("  <style>".to_string());
    lines.push(
        "    text { font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; }"
            .to_string(),
    );
    lines.push("  </style>".to_string());
    lines.push(format!(
        "  <rect width=\"{}\" height=\"{}\" fill=\"white\" rx=\"8\"/>",
        width, height
    ));

    lines.push(format!(
        "  <text x=\"{}\" y=\"28\" text-anchor=\"middle\" font-size=\"15\" font-weight=\"bold\" fill=\"#111827\">{}</text>",
        width / 2,
        escape_xml(title)
    ));

    let mut y = title_height;

    for group in groups {
        lines.push(format!(
            "  <text x=\"12\" y=\"{}\" font-size=\"13\" font-weight=\"600\" fill=\"#374151\">{}</text>",
            y + 16,
            escape_xml(&group.label)
        ));
        y += group_header_height;

        let max_value = group.bars.iter().map(|b| b.value).fold(0.0f64, f64::max);

        for bar in &group.bars {
            let bar_w = if max_value > 0.0 {
                (bar.value / max_value) * bar_area_width as f64
            } else {
                0.0
            };

            lines.push(format!(
                "  <text x=\"{}\" y=\"{}\" text-anchor=\"end\" font-size=\"11\" fill=\"#6b7280\">{}</text>",
                label_width - 4,
                y + 14,
                escape_xml(&bar.label)
            ));

            lines.push(format!(
                "  <rect x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\" fill=\"{}\" rx=\"3\"/>",
                label_width,
                y,
                f64::max(bar_w, 2.0) as i32,
                bar_height,
                bar.color
            ));

            lines.push(format!(
                "  <text x=\"{}\" y=\"{}\" font-size=\"11\" fill=\"#374151\" font-weight=\"500\">{}</text>",
                label_width as f64 + bar_w + 6.0,
                y + 14,
                format_ops(bar.value)
            ));

            y += bar_height + bar_gap;
        }
        y += group_gap - bar_gap;
    }

    lines.push("</svg>".to_string());
    lines.join("\n")
}

// ============ Example Loading ============

struct Example {
    name: String,
    states: Vec<StateData>,
}

struct StateData {
    json_value: serde_json::Value,
    json_encoded: Vec<u8>,
    msgpack_encoded: Vec<u8>,
    deltapack_encode: Box<dyn Fn() -> Vec<u8>>,
    deltapack_decode: Box<dyn Fn()>,
    protobuf_encode: Box<dyn Fn() -> Vec<u8>>,
    protobuf_decode: Box<dyn Fn()>,
    avro_encode: Box<dyn Fn() -> Vec<u8>>,
    avro_decode: Box<dyn Fn()>,
}

fn load_examples(examples_dir: &PathBuf) -> Vec<Example> {
    let mut examples = Vec::new();

    // Load in same order as TS/C# benchmarks
    if let Some(example) = load_game_state_example(examples_dir) {
        examples.push(example);
    }

    if let Some(example) = load_primitives_example(examples_dir) {
        examples.push(example);
    }

    if let Some(example) = load_test_example(examples_dir) {
        examples.push(example);
    }

    if let Some(example) = load_user_example(examples_dir) {
        examples.push(example);
    }

    examples
}

// Builds per-state Avro encode/decode closures using serde_avro_fast against
// the rsgen-avro-generated typed struct. No Value tree, no clone tax —
// serde-driven, ref-resolving, and roughly matches Protobuf's prost path
// architecturally.
fn build_avro_typed<T>(
    examples_dir: &PathBuf,
    example_name: &str,
    json_values: &[serde_json::Value],
) -> Vec<(Box<dyn Fn() -> Vec<u8>>, Box<dyn Fn()>)>
where
    T: Serialize + DeserializeOwned + PartialEq + std::fmt::Debug + 'static,
{
    let schema_path = examples_dir.join(example_name).join("schema.avsc");
    let schema_json = fs::read_to_string(&schema_path).expect("read avro schema");
    // Leak the schema to get a 'static reference. SerializerConfig borrows
    // from Schema; leaking lets us put it in a 'static closure without
    // self-referential struct gymnastics. The benchmark process is short
    // and schemas are fixed, so the "leak" is bounded.
    let schema: &'static AvroSchema =
        Box::leak(Box::new(schema_json.parse().expect("parse avro schema")));

    json_values
        .iter()
        .map(|json| {
            let typed: T = serde_json::from_value(json.clone()).expect("json → typed avro");
            let mut ser_cfg = SerializerConfig::new(schema);
            let bytes = to_datum_vec(&typed, &mut ser_cfg).expect("avro encode");

            // Round-trip: decode back to T and compare. T's PartialEq is
            // order-independent for HashMap fields, so differences in map
            // iteration order don't cause spurious failures.
            let decoded: T = from_datum_slice(&bytes, schema).expect("avro decode");
            assert_eq!(
                typed, decoded,
                "Avro round-trip failed for {}",
                example_name
            );

            // SerializerConfig holds internal buffers worth reusing across
            // calls. RefCell gives the Fn closure interior-mutable access
            // without the atomic lock/unlock overhead of Mutex; the
            // benchmark loop is single-threaded.
            let encode_typed = typed;
            let ser_cfg = RefCell::new(SerializerConfig::new(schema));
            let encode: Box<dyn Fn() -> Vec<u8>> = Box::new(move || {
                let mut cfg = ser_cfg.borrow_mut();
                to_datum_vec(&encode_typed, &mut cfg).unwrap()
            });

            let decode_bytes = bytes;
            let decode: Box<dyn Fn()> = Box::new(move || {
                let _: T = from_datum_slice(&decode_bytes, schema).unwrap();
            });

            (encode, decode)
        })
        .collect()
}

fn load_state_files(examples_dir: &PathBuf, name: &str) -> Vec<String> {
    let dir = examples_dir.join(name);
    let mut state_files: Vec<_> = fs::read_dir(&dir)
        .unwrap()
        .filter_map(|e| e.ok())
        .map(|e| e.path())
        .filter(|p| {
            p.file_name()
                .and_then(|n| n.to_str())
                .map(|n| n.starts_with("state") && n.ends_with(".json"))
                .unwrap_or(false)
        })
        .collect();

    state_files.sort_by(|a, b| {
        let a_num: u32 = a
            .file_stem()
            .unwrap()
            .to_str()
            .unwrap()
            .replace("state", "")
            .parse()
            .unwrap_or(0);
        let b_num: u32 = b
            .file_stem()
            .unwrap()
            .to_str()
            .unwrap()
            .replace("state", "")
            .parse()
            .unwrap_or(0);
        a_num.cmp(&b_num)
    });

    state_files
        .into_iter()
        .map(|p| fs::read_to_string(p).unwrap())
        .collect()
}

fn load_primitives_example(examples_dir: &PathBuf) -> Option<Example> {
    use generated::primitives::Primitives;

    let jsons = load_state_files(examples_dir, "Primitives");
    if jsons.is_empty() {
        return None;
    }

    let json_values: Vec<serde_json::Value> = jsons
        .iter()
        .map(|s| serde_json::from_str(s).unwrap())
        .collect();
    let avro_parts =
        build_avro_typed::<avro::primitives::Primitives>(examples_dir, "Primitives", &json_values);

    let states: Vec<StateData> = jsons
        .into_iter()
        .zip(json_values.into_iter())
        .zip(avro_parts.into_iter())
        .map(|((json, json_value), (avro_encode, avro_decode))| {
            let typed: Primitives = serde_json::from_str(&json).unwrap();
            let json_encoded = serde_json::to_vec(&json_value).unwrap();
            let msgpack_encoded = rmp_serde::to_vec(&json_value).unwrap();
            let deltapack_encoded = typed.encode();

            // Verify DeltaPack round-trip
            let decoded = Primitives::decode(&deltapack_encoded);
            assert!(
                typed.equals(&decoded),
                "DeltaPack round-trip failed for Primitives"
            );

            // Verify Protobuf round-trip
            let proto: protobuf::primitives::Primitives = serde_json::from_str(&json).unwrap();
            let proto_encoded = proto.encode_to_vec();
            let proto_decoded =
                protobuf::primitives::Primitives::decode(proto_encoded.as_slice()).unwrap();
            assert_eq!(
                proto, proto_decoded,
                "Protobuf round-trip failed for Primitives"
            );

            let typed_clone = typed.clone();
            let proto_clone = proto;
            let proto_encoded_for_decode = proto_encoded;
            StateData {
                json_value,
                json_encoded,
                msgpack_encoded,
                deltapack_encode: Box::new(move || typed_clone.encode()),
                deltapack_decode: Box::new(move || {
                    Primitives::decode(&deltapack_encoded);
                }),
                protobuf_encode: Box::new(move || proto_clone.encode_to_vec()),
                protobuf_decode: Box::new(move || {
                    protobuf::primitives::Primitives::decode(proto_encoded_for_decode.as_slice())
                        .unwrap();
                }),
                avro_encode,
                avro_decode,
            }
        })
        .collect();

    Some(Example {
        name: "Primitives".to_string(),
        states,
    })
}

fn load_test_example(examples_dir: &PathBuf) -> Option<Example> {
    use generated::test::Test;

    let jsons = load_state_files(examples_dir, "Test");
    if jsons.is_empty() {
        return None;
    }

    let json_values: Vec<serde_json::Value> = jsons
        .iter()
        .map(|s| serde_json::from_str(s).unwrap())
        .collect();
    let avro_parts = build_avro_typed::<avro::test::Test>(examples_dir, "Test", &json_values);

    let states: Vec<StateData> = jsons
        .into_iter()
        .zip(json_values.into_iter())
        .zip(avro_parts.into_iter())
        .map(|((json, json_value), (avro_encode, avro_decode))| {
            let typed: Test = serde_json::from_str(&json).unwrap();
            let json_encoded = serde_json::to_vec(&json_value).unwrap();
            let msgpack_encoded = rmp_serde::to_vec(&json_value).unwrap();
            let deltapack_encoded = typed.encode();

            // Verify DeltaPack round-trip
            let decoded = Test::decode(&deltapack_encoded);
            assert!(
                typed.equals(&decoded),
                "DeltaPack round-trip failed for Test"
            );

            // Verify Protobuf round-trip
            let proto: protobuf::test::Test = serde_json::from_str(&json).unwrap();
            let proto_encoded = proto.encode_to_vec();
            let proto_decoded = protobuf::test::Test::decode(proto_encoded.as_slice()).unwrap();
            assert_eq!(proto, proto_decoded, "Protobuf round-trip failed for Test");

            let typed_clone = typed.clone();
            let proto_clone = proto;
            let proto_encoded_for_decode = proto_encoded;
            StateData {
                json_value,
                json_encoded,
                msgpack_encoded,
                deltapack_encode: Box::new(move || typed_clone.encode()),
                deltapack_decode: Box::new(move || {
                    Test::decode(&deltapack_encoded);
                }),
                protobuf_encode: Box::new(move || proto_clone.encode_to_vec()),
                protobuf_decode: Box::new(move || {
                    protobuf::test::Test::decode(proto_encoded_for_decode.as_slice()).unwrap();
                }),
                avro_encode,
                avro_decode,
            }
        })
        .collect();

    Some(Example {
        name: "Test".to_string(),
        states,
    })
}

fn load_user_example(examples_dir: &PathBuf) -> Option<Example> {
    use generated::user::User;

    let jsons = load_state_files(examples_dir, "User");
    if jsons.is_empty() {
        return None;
    }

    let json_values: Vec<serde_json::Value> = jsons
        .iter()
        .map(|s| serde_json::from_str(s).unwrap())
        .collect();
    let avro_parts = build_avro_typed::<avro::user::User>(examples_dir, "User", &json_values);

    let states: Vec<StateData> = jsons
        .into_iter()
        .zip(json_values.into_iter())
        .zip(avro_parts.into_iter())
        .map(|((json, json_value), (avro_encode, avro_decode))| {
            let typed: User = serde_json::from_str(&json).unwrap();
            let json_encoded = serde_json::to_vec(&json_value).unwrap();
            let msgpack_encoded = rmp_serde::to_vec(&json_value).unwrap();
            let deltapack_encoded = typed.encode();

            // Verify DeltaPack round-trip
            let decoded = User::decode(&deltapack_encoded);
            assert!(
                typed.equals(&decoded),
                "DeltaPack round-trip failed for User"
            );

            // Verify Protobuf round-trip
            let proto: protobuf::user::User = serde_json::from_str(&json).unwrap();
            let proto_encoded = proto.encode_to_vec();
            let proto_decoded = protobuf::user::User::decode(proto_encoded.as_slice()).unwrap();
            assert_eq!(proto, proto_decoded, "Protobuf round-trip failed for User");

            let typed_clone = typed.clone();
            let proto_clone = proto;
            let proto_encoded_for_decode = proto_encoded;
            StateData {
                json_value,
                json_encoded,
                msgpack_encoded,
                deltapack_encode: Box::new(move || typed_clone.encode()),
                deltapack_decode: Box::new(move || {
                    User::decode(&deltapack_encoded);
                }),
                protobuf_encode: Box::new(move || proto_clone.encode_to_vec()),
                protobuf_decode: Box::new(move || {
                    protobuf::user::User::decode(proto_encoded_for_decode.as_slice()).unwrap();
                }),
                avro_encode,
                avro_decode,
            }
        })
        .collect();

    Some(Example {
        name: "User".to_string(),
        states,
    })
}

fn load_game_state_example(examples_dir: &PathBuf) -> Option<Example> {
    use generated::game_state::GameState;

    let jsons = load_state_files(examples_dir, "GameState");
    if jsons.is_empty() {
        return None;
    }

    let json_values: Vec<serde_json::Value> = jsons
        .iter()
        .map(|s| serde_json::from_str(s).unwrap())
        .collect();
    let avro_parts =
        build_avro_typed::<avro::gamestate::GameState>(examples_dir, "GameState", &json_values);

    let states: Vec<StateData> = jsons
        .into_iter()
        .zip(json_values.into_iter())
        .zip(avro_parts.into_iter())
        .map(|((json, json_value), (avro_encode, avro_decode))| {
            let typed: GameState = serde_json::from_str(&json).unwrap();
            let json_encoded = serde_json::to_vec(&json_value).unwrap();
            let msgpack_encoded = rmp_serde::to_vec(&json_value).unwrap();
            let deltapack_encoded = typed.encode();

            // Verify DeltaPack round-trip
            let decoded = GameState::decode(&deltapack_encoded);
            assert!(
                typed.equals(&decoded),
                "DeltaPack round-trip failed for GameState"
            );

            // Verify Protobuf round-trip
            let proto: protobuf::gamestate::GameState = serde_json::from_str(&json).unwrap();
            let proto_encoded = proto.encode_to_vec();
            let proto_decoded =
                protobuf::gamestate::GameState::decode(proto_encoded.as_slice()).unwrap();
            assert_eq!(
                proto, proto_decoded,
                "Protobuf round-trip failed for GameState"
            );

            let typed_clone = typed.clone();
            let proto_clone = proto;
            let proto_encoded_for_decode = proto_encoded;
            StateData {
                json_value,
                json_encoded,
                msgpack_encoded,
                deltapack_encode: Box::new(move || typed_clone.encode()),
                deltapack_decode: Box::new(move || {
                    GameState::decode(&deltapack_encoded);
                }),
                protobuf_encode: Box::new(move || proto_clone.encode_to_vec()),
                protobuf_decode: Box::new(move || {
                    protobuf::gamestate::GameState::decode(proto_encoded_for_decode.as_slice())
                        .unwrap();
                }),
                avro_encode,
                avro_decode,
            }
        })
        .collect();

    Some(Example {
        name: "GameState".to_string(),
        states,
    })
}
