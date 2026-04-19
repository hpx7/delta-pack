//! Conformance tests: verify CLI-generated types produce byte-identical output
//! against the committed goldens. The CLI emits structs/enums carrying
//! `#[derive(DeltaPack)]`, so this exercises both the CLI translation and the
//! proc-macro expansion.

#[path = "../generated/examples/mod.rs"]
mod codegen;

use delta_pack::DeltaPack;
use serde::de::DeserializeOwned;
use serde::Serialize;
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

fn run_conformance<T>(example: &str, states: &[&str])
where
    T: DeltaPack + Serialize + DeserializeOwned,
{
    // Encode input and compare to golden snapshot.
    for state in states {
        let golden = read_golden_bytes(example, &format!("{}.snapshot.bin", state));
        let json = read_state(example, state);
        let obj: T = serde_json::from_str(&json).unwrap();
        let encoded = obj.encode();
        assert_eq!(encoded, golden, "{} {} encode bytes", example, state);
    }

    // Decode golden snapshot and compare to expected state.
    for state in states {
        let golden = read_golden_bytes(example, &format!("{}.snapshot.bin", state));
        let json = read_state(example, state);
        let expected: T = serde_json::from_str(&json).unwrap();
        let decoded = T::decode(&golden);
        assert!(expected.equals(&decoded), "{} {} decode", example, state);
    }

    // Encode diff old→new and compare to golden diff.
    for i in 0..states.len().saturating_sub(1) {
        let (old, new) = (states[i], states[i + 1]);
        let golden = read_golden_bytes(example, &format!("{}_{}.diff.bin", old, new));
        let old_obj: T = serde_json::from_str(&read_state(example, old)).unwrap();
        let new_obj: T = serde_json::from_str(&read_state(example, new)).unwrap();
        let encoded = T::encode_diff(&old_obj, &new_obj);
        assert_eq!(encoded, golden, "{} {}->{} diff bytes", example, old, new);
    }

    // Decode golden diff against old and compare to expected new.
    for i in 0..states.len().saturating_sub(1) {
        let (old, new) = (states[i], states[i + 1]);
        let golden = read_golden_bytes(example, &format!("{}_{}.diff.bin", old, new));
        let old_obj: T = serde_json::from_str(&read_state(example, old)).unwrap();
        let expected: T = serde_json::from_str(&read_state(example, new)).unwrap();
        let decoded = T::decode_diff(&old_obj, &golden);
        assert!(
            expected.equals(&decoded),
            "{} {}->{} decode_diff",
            example,
            old,
            new
        );
    }
}

#[test]
fn primitives() {
    run_conformance::<codegen::primitives::Primitives>("Primitives", &["state1", "state2"]);
}

#[test]
fn test() {
    run_conformance::<codegen::test::Test>("Test", &["state1", "state2"]);
}

#[test]
fn user() {
    run_conformance::<codegen::user::User>("User", &["state1", "state2"]);
}

#[test]
fn game_state() {
    run_conformance::<codegen::game_state::GameState>("GameState", &["state1", "state2", "state3"]);
}
