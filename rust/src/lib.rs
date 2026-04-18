#![doc = include_str!("../README.md")]

mod decoder;
mod delta_pack;
mod encoder;
mod helpers;
mod rle;
mod varint;

#[doc(hidden)]
pub mod __private;

pub use decoder::Decoder;
pub use delta_pack::DeltaPack;
pub use delta_pack_derive::DeltaPack;
pub use encoder::Encoder;
pub use helpers::{
    equals_array, equals_float, equals_float_quantized, equals_optional, equals_record,
};
pub use indexmap::IndexMap;
