//! Items the derive macro emits that are **not** part of the public API.
//!
//! This module is `pub` so the expanded code can reach it, but hidden from
//! rustdoc and sealed so downstream crates cannot implement the traits.

/// Discriminator layout for a C-style enum derived via `#[derive(DeltaPack)]`.
/// The derive emits an `impl` of this trait for every unit-variant enum; the
/// `encode_into` / `decode_from` body reads the constant and the converters
/// here, so `NUM_BITS` / `to_u32` / `try_from_u32` stay off the enum's public
/// surface.
pub trait EnumRepr: Sized + sealed::Sealed {
    const NUM_BITS: u8;
    fn to_u32(self) -> u32;
    fn try_from_u32(val: u32) -> Option<Self>;
}

mod sealed {
    pub trait Sealed {}
}

pub use sealed::Sealed;
