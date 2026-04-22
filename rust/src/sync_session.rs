use crate::DeltaPack;

/// A stateful handle over a one-way state-sync session between two endpoints.
///
/// Each endpoint holds a [`SyncSession`] representing the current shared view
/// of the peer's state. The sender calls [`encode`](Self::encode) to produce
/// bytes; the receiver calls [`decode`](Self::decode) to apply them. Both
/// sides converge on the same view as long as messages are delivered in order.
///
/// The type handles the "first call is full encode, subsequent are diffs"
/// distinction internally. It also ensures the sender's view always matches
/// what the peer reconstructs — even when the user's `state` has been mutated
/// or reordered in ways that would break a raw `encode_diff` call.
///
/// # Example
///
/// ```ignore
/// let mut session = SyncSession::<GameState>::new();
///
/// // Sender
/// let bytes = session.encode(&state);
///
/// // Receiver
/// let state = session.decode(&bytes);
/// ```
pub struct SyncSession<T: DeltaPack + Clone> {
    view: Option<T>,
}

impl<T: DeltaPack + Clone> SyncSession<T> {
    /// Create a new session with no view yet.
    pub fn new() -> Self {
        Self { view: None }
    }

    /// Produce bytes to send to the peer. First call emits a full encode;
    /// subsequent calls emit a diff against the current view. Either way,
    /// the internal view is updated to match what the peer will hold after
    /// applying the returned bytes.
    pub fn encode(&mut self, state: &T) -> Vec<u8> {
        match &self.view {
            None => {
                let bytes = state.encode();
                // Full encode iterates `state` in its insertion order, so
                // `state`'s order is the wire order. A clone captures a safe
                // "peer view" copy.
                self.view = Some(state.clone());
                bytes
            }
            Some(view) => {
                let bytes = T::encode_diff(view, state);
                // Simulate the peer's decode so our view stays aligned with
                // theirs, regardless of any reordering in the user's `state`.
                self.view = Some(T::decode_diff(view, &bytes));
                bytes
            }
        }
    }

    /// Apply bytes received from the peer. First call expects a full encode;
    /// subsequent calls expect a diff. Returns a reference to the updated view.
    pub fn decode(&mut self, bytes: &[u8]) -> &T {
        self.view = Some(match &self.view {
            None => T::decode(bytes),
            Some(view) => T::decode_diff(view, bytes),
        });
        self.view.as_ref().expect("view just assigned")
    }

    /// The current view, or `None` if neither [`encode`](Self::encode) nor
    /// [`decode`](Self::decode) has been called.
    pub fn current(&self) -> Option<&T> {
        self.view.as_ref()
    }
}

impl<T: DeltaPack + Clone> Default for SyncSession<T> {
    fn default() -> Self {
        Self::new()
    }
}
