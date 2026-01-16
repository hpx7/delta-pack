//! Conformance tests that verify Rust implementation produces identical binary output
//! to golden bytes (source of truth).

#[path = "../generated/examples/mod.rs"]
mod conformance_generated;

use std::fs;
use std::path::PathBuf;

fn examples_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("examples")
}

fn read_golden_bytes(example: &str, filename: &str) -> Vec<u8> {
    let path = examples_dir().join(example).join(filename);
    fs::read(&path).unwrap_or_else(|e| panic!("Failed to read golden bytes {:?}: {}", path, e))
}

fn read_state(example: &str, state: &str) -> String {
    let path = examples_dir().join(example).join(format!("{}.json", state));
    fs::read_to_string(&path).unwrap_or_else(|e| panic!("Failed to read state {:?}: {}", path, e))
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
            fn encode_matches_golden() {
                for state in states() {
                    let golden_bytes = read_golden_bytes($example, &format!("{}.snapshot.bin", state));

                    let json = read_state($example, state);
                    let obj: $type_name = serde_json::from_str(&json).unwrap();
                    let rust_encoded = obj.encode();

                    // Encoding order is undefined (HashMap), so only check decoded equality
                    let golden_decoded = $type_name::decode(&golden_bytes);
                    let rust_decoded = $type_name::decode(&rust_encoded);
                    assert!(
                        golden_decoded.equals(&rust_decoded),
                        "{} {} decoded mismatch",
                        $example,
                        state
                    );
                }
            }

            #[test]
            fn decode_from_golden() {
                for state in states() {
                    let golden_bytes = read_golden_bytes($example, &format!("{}.snapshot.bin", state));

                    let json = read_state($example, state);
                    let expected: $type_name = serde_json::from_str(&json).unwrap();
                    let decoded = $type_name::decode(&golden_bytes);

                    assert!(
                        expected.equals(&decoded),
                        "{} {} decode mismatch",
                        $example,
                        state
                    );
                }
            }

            #[test]
            fn encode_diff_matches_golden() {
                let state_list = states();
                for i in 0..state_list.len().saturating_sub(1) {
                    let old_state = state_list[i];
                    let new_state = state_list[i + 1];

                    let golden_diff = read_golden_bytes(
                        $example,
                        &format!("{}_{}.diff.bin", old_state, new_state),
                    );

                    let old_json = read_state($example, old_state);
                    let new_json = read_state($example, new_state);
                    let old_obj: $type_name = serde_json::from_str(&old_json).unwrap();
                    let new_obj: $type_name = serde_json::from_str(&new_json).unwrap();
                    let rust_encoded = $type_name::encode_diff(&old_obj, &new_obj);

                    // Encoding order is undefined (HashMap), so only check decoded equality
                    let golden_decoded = $type_name::decode_diff(&old_obj, &golden_diff);
                    let rust_decoded = $type_name::decode_diff(&old_obj, &rust_encoded);
                    assert!(
                        golden_decoded.equals(&rust_decoded),
                        "{} {}->{} encode_diff decoded mismatch",
                        $example, old_state, new_state
                    );
                }
            }

            #[test]
            fn decode_diff_from_golden() {
                let state_list = states();
                for i in 0..state_list.len().saturating_sub(1) {
                    let old_state = state_list[i];
                    let new_state = state_list[i + 1];

                    let golden_diff = read_golden_bytes(
                        $example,
                        &format!("{}_{}.diff.bin", old_state, new_state),
                    );

                    let old_json = read_state($example, old_state);
                    let new_json = read_state($example, new_state);
                    let old_obj: $type_name = serde_json::from_str(&old_json).unwrap();
                    let expected: $type_name = serde_json::from_str(&new_json).unwrap();
                    let decoded = $type_name::decode_diff(&old_obj, &golden_diff);

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
