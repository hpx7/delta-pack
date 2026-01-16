// Rust benchmarks comparing JSON, MessagePack, and DeltaPack
// Similar to TypeScript and C# benchmarks

#[cfg(feature = "mimalloc")]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

mod generated;

use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::time::{Duration, Instant};

const WARMUP_ITERATIONS: usize = 1000;
const BENCHMARK_DURATION_MS: u64 = 500;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let filter: Vec<&str> = args.iter().skip(1).map(|s| s.as_str()).collect();

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
    run_encode_benchmarks(&examples);

    println!("\n## Decoding Speed Comparison (ops/s)\n");
    println!("Higher is better. The multiplier shows how much slower each format is compared to the fastest.\n");
    run_decode_benchmarks(&examples);
}

fn global_warmup(examples: &[Example]) {
    for example in examples {
        for state in &example.states {
            // Warmup encode
            for _ in 0..WARMUP_ITERATIONS {
                let _ = serde_json::to_vec(&state.json_value);
                let _ = rmp_serde::to_vec(&state.json_value);
                let _ = (state.deltapack_encode)();
            }
            // Warmup decode
            for _ in 0..WARMUP_ITERATIONS {
                let _: serde_json::Value = serde_json::from_slice(&state.json_encoded).unwrap();
                let _: serde_json::Value = rmp_serde::from_slice(&state.msgpack_encoded).unwrap();
                let _ = (state.deltapack_decode)();
            }
        }
    }
}

fn run_encode_benchmarks(examples: &[Example]) {
    for example in examples {
        println!("### {}\n", example.name);

        let mut results: HashMap<&str, Vec<f64>> = HashMap::new();
        results.insert("JSON", Vec::new());
        results.insert("MessagePack", Vec::new());
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
    }
}

fn run_decode_benchmarks(examples: &[Example]) {
    for example in examples {
        println!("### {}\n", example.name);

        let mut results: HashMap<&str, Vec<f64>> = HashMap::new();
        results.insert("JSON", Vec::new());
        results.insert("MessagePack", Vec::new());
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
    }
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
    let format_order = ["JSON", "MessagePack", "DeltaPack"];
    let mut rows: Vec<Vec<String>> = Vec::new();
    for format in format_order {
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

    let states: Vec<StateData> = jsons
        .into_iter()
        .map(|json| {
            let json_value: serde_json::Value = serde_json::from_str(&json).unwrap();
            let typed: Primitives = serde_json::from_str(&json).unwrap();
            let json_encoded = serde_json::to_vec(&json_value).unwrap();
            let msgpack_encoded = rmp_serde::to_vec(&json_value).unwrap();
            let deltapack_encoded = typed.encode();

            // Verify round-trip
            let decoded = Primitives::decode(&deltapack_encoded);
            assert!(
                typed.equals(&decoded),
                "DeltaPack round-trip failed for Primitives"
            );

            let typed_clone = typed.clone();
            StateData {
                json_value,
                json_encoded,
                msgpack_encoded,
                deltapack_encode: Box::new(move || typed_clone.encode()),
                deltapack_decode: Box::new(move || {
                    Primitives::decode(&deltapack_encoded);
                }),
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

    let states: Vec<StateData> = jsons
        .into_iter()
        .map(|json| {
            let json_value: serde_json::Value = serde_json::from_str(&json).unwrap();
            let typed: Test = serde_json::from_str(&json).unwrap();
            let json_encoded = serde_json::to_vec(&json_value).unwrap();
            let msgpack_encoded = rmp_serde::to_vec(&json_value).unwrap();
            let deltapack_encoded = typed.encode();

            // Verify round-trip
            let decoded = Test::decode(&deltapack_encoded);
            assert!(
                typed.equals(&decoded),
                "DeltaPack round-trip failed for Test"
            );

            let typed_clone = typed.clone();
            StateData {
                json_value,
                json_encoded,
                msgpack_encoded,
                deltapack_encode: Box::new(move || typed_clone.encode()),
                deltapack_decode: Box::new(move || {
                    Test::decode(&deltapack_encoded);
                }),
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

    let states: Vec<StateData> = jsons
        .into_iter()
        .map(|json| {
            let json_value: serde_json::Value = serde_json::from_str(&json).unwrap();
            let typed: User = serde_json::from_str(&json).unwrap();
            let json_encoded = serde_json::to_vec(&json_value).unwrap();
            let msgpack_encoded = rmp_serde::to_vec(&json_value).unwrap();
            let deltapack_encoded = typed.encode();

            // Verify round-trip
            let decoded = User::decode(&deltapack_encoded);
            assert!(
                typed.equals(&decoded),
                "DeltaPack round-trip failed for User"
            );

            let typed_clone = typed.clone();
            StateData {
                json_value,
                json_encoded,
                msgpack_encoded,
                deltapack_encode: Box::new(move || typed_clone.encode()),
                deltapack_decode: Box::new(move || {
                    User::decode(&deltapack_encoded);
                }),
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

    let states: Vec<StateData> = jsons
        .into_iter()
        .map(|json| {
            let json_value: serde_json::Value = serde_json::from_str(&json).unwrap();
            let typed: GameState = serde_json::from_str(&json).unwrap();
            let json_encoded = serde_json::to_vec(&json_value).unwrap();
            let msgpack_encoded = rmp_serde::to_vec(&json_value).unwrap();
            let deltapack_encoded = typed.encode();

            // Verify round-trip
            let decoded = GameState::decode(&deltapack_encoded);
            assert!(
                typed.equals(&decoded),
                "DeltaPack round-trip failed for GameState"
            );

            let typed_clone = typed.clone();
            StateData {
                json_value,
                json_encoded,
                msgpack_encoded,
                deltapack_encode: Box::new(move || typed_clone.encode()),
                deltapack_decode: Box::new(move || {
                    GameState::decode(&deltapack_encoded);
                }),
            }
        })
        .collect();

    Some(Example {
        name: "GameState".to_string(),
        states,
    })
}
