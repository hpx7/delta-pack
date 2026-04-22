//! Tests for the SyncSession helper — correctness guarantees over a
//! one-way state-sync channel.
use delta_pack::{DeltaPack, IndexMap};

#[derive(Clone, Debug, PartialEq, DeltaPack)]
struct Creature {
    hp: i64,
    name: String,
}

#[derive(Clone, Debug, PartialEq, DeltaPack)]
struct GameState {
    creatures: IndexMap<u64, Creature>,
}

fn creature(hp: i64, name: &str) -> Creature {
    Creature {
        hp,
        name: name.to_string(),
    }
}

#[test]
fn round_trips_a_sequence_of_ticks() {
    let mut sender = GameState::create_sync_session();
    let mut receiver = GameState::create_sync_session();

    let mut state = GameState {
        creatures: IndexMap::new(),
    };
    state.creatures.insert(1, creature(10, "a"));
    state.creatures.insert(2, creature(20, "b"));

    for _ in 0..5 {
        let bytes = sender.encode(&state);
        let decoded = receiver.decode(&bytes).clone();
        assert_eq!(decoded.creatures.get(&1), state.creatures.get(&1));
        assert_eq!(decoded.creatures.get(&2), state.creatures.get(&2));
        state.creatures.get_mut(&1).unwrap().hp += 1;
    }

    assert!(sender.current().is_some());
    assert!(receiver.current().is_some());
}

#[test]
fn survives_prev_reordered_between_encodes() {
    let mut sender = GameState::create_sync_session();
    let mut receiver = GameState::create_sync_session();

    let mut state = GameState {
        creatures: IndexMap::new(),
    };
    state.creatures.insert(1, creature(10, "a"));
    state.creatures.insert(2, creature(20, "b"));
    state.creatures.insert(3, creature(30, "c"));

    // Tick 1: initial sync
    receiver.decode(&sender.encode(&state));

    // Between ticks: user-side reordering via shift_remove + re-insert at tail.
    // Net value change: zero.
    let a = state.creatures.shift_remove(&1).unwrap();
    state.creatures.insert(1, a);
    // state is now ordered [2, 3, 1] — but SyncSession's view still tracks [1, 2, 3].

    // Tick 2: real update to creature 3
    state.creatures.get_mut(&3).unwrap().hp = 99;

    let decoded = receiver.decode(&sender.encode(&state)).clone();

    assert_eq!(decoded.creatures.get(&1), Some(&creature(10, "a")));
    assert_eq!(decoded.creatures.get(&2), Some(&creature(20, "b")));
    assert_eq!(decoded.creatures.get(&3), Some(&creature(99, "c"))); // ← not corrupted
}

#[test]
fn sender_and_receiver_views_converge() {
    let mut sender = GameState::create_sync_session();
    let mut receiver = GameState::create_sync_session();

    let mut state = GameState {
        creatures: IndexMap::new(),
    };
    state.creatures.insert(1, creature(10, "a"));

    receiver.decode(&sender.encode(&state));
    assert_eq!(sender.current(), receiver.current());

    state.creatures.insert(2, creature(20, "b"));
    receiver.decode(&sender.encode(&state));
    assert_eq!(sender.current(), receiver.current());

    state.creatures.shift_remove(&1);
    receiver.decode(&sender.encode(&state));
    assert_eq!(sender.current(), receiver.current());
}

#[test]
fn first_call_encodes_full_state_then_diffs() {
    let mut sender = GameState::create_sync_session();
    let mut state = GameState {
        creatures: IndexMap::new(),
    };
    state.creatures.insert(1, creature(10, "a"));

    let full_bytes = sender.encode(&state);
    let diff_bytes = sender.encode(&state); // no change; should be a tiny diff
    assert!(diff_bytes.len() < full_bytes.len());
}
