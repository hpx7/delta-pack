use crate::{Decoder, Encoder, SyncSession};

/// Common surface shared by every `delta-pack`-encodable type, whether produced
/// by the CLI's Rust codegen or the `#[derive(DeltaPack)]` proc-macro.
///
/// Implementers provide the core serialization primitives (`encode_into`,
/// `decode_from`, the diff `_into`/`_from` variants, and `equals`). The
/// whole-value entry points (`encode`, `decode`, `encode_diff`, `decode_diff`)
/// have default implementations: `encode_diff` forwards to `encode_diff_into`,
/// which is the right shape for enums and unions. Structs override
/// `encode_diff`/`decode_diff` to wrap in `push_object_diff` /
/// `next_object_diff`, since object diffs carry a per-object change bit.
pub trait DeltaPack: Sized {
    #[must_use]
    fn equals(&self, other: &Self) -> bool;

    fn encode_into(&self, encoder: &mut Encoder);
    fn decode_from(decoder: &mut Decoder) -> Self;

    fn encode_diff_into(a: &Self, b: &Self, encoder: &mut Encoder);
    fn decode_diff_from(obj: &Self, decoder: &mut Decoder) -> Self;

    #[must_use]
    fn encode(&self) -> Vec<u8> {
        Encoder::encode(|encoder| {
            self.encode_into(encoder);
            encoder.finish()
        })
    }

    #[must_use]
    fn decode(buf: &[u8]) -> Self {
        Decoder::decode(buf, |decoder| Self::decode_from(decoder))
    }

    #[must_use]
    fn encode_diff(a: &Self, b: &Self) -> Vec<u8> {
        Encoder::encode(|encoder| {
            Self::encode_diff_into(a, b, encoder);
            encoder.finish()
        })
    }

    #[must_use]
    fn decode_diff(obj: &Self, diff: &[u8]) -> Self {
        Decoder::decode(diff, |decoder| Self::decode_diff_from(obj, decoder))
    }

    /// Construct a [`SyncSession`] for this type — the recommended handle for
    /// state sync streams. Only available when `Self: Clone`, which generated
    /// and `#[derive(DeltaPack)]` types satisfy by convention.
    #[must_use]
    fn create_sync_session() -> SyncSession<Self>
    where
        Self: Clone,
    {
        SyncSession::new()
    }
}
