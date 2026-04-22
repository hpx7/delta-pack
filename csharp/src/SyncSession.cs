namespace DeltaPack;

/// <summary>
/// A stateful handle over a one-way state-sync session between two endpoints.
/// <para>
/// Each endpoint holds a <see cref="SyncSession{T}"/> representing the current
/// shared view of the peer's state. The sender calls <see cref="Encode"/> to
/// produce bytes; the receiver calls <see cref="Decode"/> to apply them. Both
/// sides converge on the same view as long as messages are delivered in order.
/// </para>
/// <para>
/// The class handles the "first call is full encode, subsequent are diffs"
/// distinction internally. It also ensures the sender's view always matches
/// what the peer reconstructs — even when the user's <c>state</c> object has
/// been mutated or reordered in ways that would break a raw
/// <c>EncodeDiff</c> call.
/// </para>
/// <para>
/// Prefer the generated <c>CreateSyncSession()</c> factory on each schema type:
/// </para>
/// <code>
/// var session = GameState.CreateSyncSession();
/// </code>
/// <para>
/// The delegate-taking constructor below is the lower-level entry point — useful
/// when you need to pass custom encode/decode/clone callbacks, but most callers
/// should go through the factory.
/// </para>
/// </summary>
public sealed class SyncSession<T>
    where T : class
{
    private readonly Func<T, byte[]> _encode;
    private readonly Func<byte[], T> _decode;
    private readonly Func<T, T, byte[]> _encodeDiff;
    private readonly Func<T, byte[], T> _decodeDiff;
    private readonly Func<T, T> _clone;
    private T? _view;

    public SyncSession(
        Func<T, byte[]> encode,
        Func<byte[], T> decode,
        Func<T, T, byte[]> encodeDiff,
        Func<T, byte[], T> decodeDiff,
        Func<T, T> clone)
    {
        _encode = encode;
        _decode = decode;
        _encodeDiff = encodeDiff;
        _decodeDiff = decodeDiff;
        _clone = clone;
    }

    /// <summary>
    /// Produce bytes to send to the peer. First call emits a full encode;
    /// subsequent calls emit a diff against the current view. Either way,
    /// the internal view is updated to match what the peer will hold after
    /// applying the returned bytes.
    /// </summary>
    public byte[] Encode(T state)
    {
        var bytes = _view is null ? _encode(state) : _encodeDiff(_view, state);
        // Maintain a view of what the peer will hold after applying `bytes`. For
        // the first call, a clone of `state` captures the wire order; for diffs,
        // simulating the peer's decode keeps us aligned even when `state` has been
        // reordered in ways that would break a raw EncodeDiff. We then stamp the
        // view as a snapshot of `state` so tracking's version-based diff filter
        // keeps working on subsequent encodes (no-op when state isn't tracked).
        _view = _view is null ? _clone(state) : _decodeDiff(_view, bytes);
        DirtyTracking.RegisterSnapshot(_view, state);
        return bytes;
    }

    /// <summary>
    /// Apply bytes received from the peer. First call expects a full encode;
    /// subsequent calls expect a diff. Returns the updated view.
    /// </summary>
    public T Decode(byte[] bytes)
    {
        _view = _view is null ? _decode(bytes) : _decodeDiff(_view, bytes);
        return _view;
    }

    /// <summary>
    /// The current view, or <c>null</c> if neither <see cref="Encode"/> nor
    /// <see cref="Decode"/> has been called.
    /// </summary>
    public T? Current => _view;
}
