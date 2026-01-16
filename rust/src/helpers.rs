use std::collections::HashMap;
use std::hash::Hash;

const FLOAT_EPSILON: f32 = 0.001;

pub fn equals_float(a: f32, b: f32) -> bool {
    (a - b).abs() < FLOAT_EPSILON
}

pub fn equals_float_quantized(a: f32, b: f32, precision: f32) -> bool {
    (a / precision).round() as i64 == (b / precision).round() as i64
}

pub fn equals_optional<T, F>(a: &Option<T>, b: &Option<T>, mut equals: F) -> bool
where
    F: FnMut(&T, &T) -> bool,
{
    match (a, b) {
        (None, None) => true,
        (Some(av), Some(bv)) => equals(av, bv),
        _ => false,
    }
}

pub fn equals_array<T, F>(a: &[T], b: &[T], mut equals: F) -> bool
where
    F: FnMut(&T, &T) -> bool,
{
    a.len() == b.len() && a.iter().zip(b.iter()).all(|(x, y)| equals(x, y))
}

pub fn equals_record<K, V, F>(a: &HashMap<K, V>, b: &HashMap<K, V>, mut value_equals: F) -> bool
where
    K: Eq + Hash,
    F: FnMut(&V, &V) -> bool,
{
    a.len() == b.len()
        && a.iter()
            .all(|(k, av)| b.get(k).is_some_and(|bv| value_equals(av, bv)))
}
