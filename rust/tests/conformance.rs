//! Conformance tests that verify Rust implementation produces identical binary output
//! to the CLI (source of truth).

#[path = "../generated/examples/mod.rs"]
mod conformance_generated;

use std::fs;
use std::path::PathBuf;
use std::process::Command;

fn examples_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("examples")
}

fn run_cli(args: &[&str]) -> Vec<u8> {
    let output = Command::new("delta-pack")
        .args(args)
        .current_dir(examples_dir())
        .output()
        .expect("Failed to execute delta-pack CLI");

    if !output.status.success() {
        panic!(
            "CLI failed with exit code {:?}: {}",
            output.status.code(),
            String::from_utf8_lossy(&output.stderr)
        );
    }

    output.stdout
}

fn schema_path(example: &str) -> String {
    examples_dir()
        .join(example)
        .join("schema.yml")
        .to_string_lossy()
        .to_string()
}

fn state_path(example: &str, state: &str) -> String {
    examples_dir()
        .join(example)
        .join(format!("{}.json", state))
        .to_string_lossy()
        .to_string()
}

fn read_state(example: &str, state: &str) -> String {
    fs::read_to_string(state_path(example, state)).expect("Failed to read state file")
}

/// Macro to generate conformance tests for an example schema
macro_rules! conformance_tests {
    ($mod_name:ident, $type_name:ident, $example:literal, $states:expr) => {
        mod $mod_name {
            use super::*;
            use crate::conformance_generated::$mod_name::$type_name;

            fn states() -> Vec<&'static str> {
                $states
            }

            #[test]
            fn encode_matches_cli() {
                for state in states() {
                    let cli_encoded = run_cli(&[
                        "encode",
                        &schema_path($example),
                        "-t",
                        $example,
                        "-i",
                        &state_path($example, state),
                    ]);

                    let json = read_state($example, state);
                    let obj: $type_name = serde_json::from_str(&json).unwrap();
                    let rust_encoded = obj.encode();

                    // Encoding order is undefined (HashMap), so only check decoded equality
                    let cli_decoded = $type_name::decode(&cli_encoded);
                    let rust_decoded = $type_name::decode(&rust_encoded);
                    assert!(
                        cli_decoded.equals(&rust_decoded),
                        "{} {} decoded mismatch",
                        $example,
                        state
                    );
                }
            }

            #[test]
            fn decode_from_cli() {
                for state in states() {
                    let encoded = run_cli(&[
                        "encode",
                        &schema_path($example),
                        "-t",
                        $example,
                        "-i",
                        &state_path($example, state),
                    ]);

                    let json = read_state($example, state);
                    let expected: $type_name = serde_json::from_str(&json).unwrap();
                    let decoded = $type_name::decode(&encoded);

                    assert!(
                        expected.equals(&decoded),
                        "{} {} decode mismatch",
                        $example,
                        state
                    );
                }
            }

            #[test]
            fn encode_diff_matches_cli() {
                let state_list = states();
                for i in 0..state_list.len().saturating_sub(1) {
                    let old_state = state_list[i];
                    let new_state = state_list[i + 1];

                    let cli_encoded = run_cli(&[
                        "encode-diff",
                        &schema_path($example),
                        "-t",
                        $example,
                        "--old",
                        &state_path($example, old_state),
                        "--new",
                        &state_path($example, new_state),
                    ]);

                    let old_json = read_state($example, old_state);
                    let new_json = read_state($example, new_state);
                    let old_obj: $type_name = serde_json::from_str(&old_json).unwrap();
                    let new_obj: $type_name = serde_json::from_str(&new_json).unwrap();
                    let rust_encoded = $type_name::encode_diff(&old_obj, &new_obj);

                    // Encoding order is undefined (HashMap), so only check decoded equality
                    let cli_decoded = $type_name::decode_diff(&old_obj, &cli_encoded);
                    let rust_decoded = $type_name::decode_diff(&old_obj, &rust_encoded);
                    assert!(
                        cli_decoded.equals(&rust_decoded),
                        "{} {}->{} encode_diff decoded mismatch",
                        $example, old_state, new_state
                    );
                }
            }

            #[test]
            fn decode_diff_from_cli() {
                let state_list = states();
                for i in 0..state_list.len().saturating_sub(1) {
                    let old_state = state_list[i];
                    let new_state = state_list[i + 1];

                    let diff_bytes = run_cli(&[
                        "encode-diff",
                        &schema_path($example),
                        "-t",
                        $example,
                        "--old",
                        &state_path($example, old_state),
                        "--new",
                        &state_path($example, new_state),
                    ]);

                    let old_json = read_state($example, old_state);
                    let new_json = read_state($example, new_state);
                    let old_obj: $type_name = serde_json::from_str(&old_json).unwrap();
                    let expected: $type_name = serde_json::from_str(&new_json).unwrap();
                    let decoded = $type_name::decode_diff(&old_obj, &diff_bytes);

                    assert!(
                        expected.equals(&decoded),
                        "{} {}->{} decode_diff mismatch",
                        $example,
                        old_state,
                        new_state
                    );
                }
            }
        }
    };
}

// Generate conformance tests for each example
conformance_tests!(primitives, Primitives, "Primitives", vec!["state1", "state2"]);
conformance_tests!(test, Test, "Test", vec!["state1"]);
conformance_tests!(user, User, "User", vec!["state1", "state2"]);
conformance_tests!(game_state, GameState, "GameState", vec!["state1", "state2", "state3", "state4", "state5", "state6"]);
