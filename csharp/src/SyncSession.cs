namespace DeltaPack;

/// <summary>
/// A stateful handle over a one-way state-sync session between two endpoints.
/// <para>
/// Each session is bound to a <see cref="DeltaPack.Tracker"/> that owns its baseline /
/// tombstone state, isolating it from any other session in the process.
/// </para>
/// <para>
/// Prefer the generated <c>CreateSyncSession()</c> / <c>CreateSyncSession(Tracker)</c>
/// factories on each schema type:
/// </para>
/// <code>
/// var session = GameState.CreateSyncSession(myTracker);
/// </code>
/// </summary>
public sealed class SyncSession<T>
    where T : class
{
    private readonly Tracker _tracker;
    private readonly Func<T, byte[]> _encode;
    private readonly Func<byte[], T> _decode;
    private readonly Func<T, T, byte[]> _encodeDiff;
    private readonly Func<T, byte[], T> _decodeDiff;
    private readonly Func<T, T> _clone;
    private T? _view;

    public SyncSession(
        Tracker tracker,
        Func<T, byte[]> encode,
        Func<byte[], T> decode,
        Func<T, T, byte[]> encodeDiff,
        Func<T, byte[], T> decodeDiff,
        Func<T, T> clone)
    {
        _tracker = tracker;
        _encode = encode;
        _decode = decode;
        _encodeDiff = encodeDiff;
        _decodeDiff = decodeDiff;
        _clone = clone;
    }

    /// <summary>
    /// Convenience overload binding to <see cref="Tracker.Default"/>. Use when you don't need
    /// per-domain isolation — typically untracked types or single-room apps.
    /// </summary>
    public SyncSession(
        Func<T, byte[]> encode,
        Func<byte[], T> decode,
        Func<T, T, byte[]> encodeDiff,
        Func<T, byte[], T> decodeDiff,
        Func<T, T> clone)
        : this(Tracker.Default, encode, decode, encodeDiff, decodeDiff, clone) { }

    /// <summary>The tracker this session's baselines are recorded against.</summary>
    public Tracker Tracker => _tracker;

    /// <summary>
    /// Produce bytes to send to the peer. First call emits a full encode; subsequent calls
    /// emit a diff against the current view. Either way, the internal view is updated to
    /// match what the peer will hold after applying the returned bytes.
    /// </summary>
    public byte[] Encode(T state)
    {
        var bytes = _view is null ? _encode(state) : _encodeDiff(_view, state);
        // Simulate the peer's decode to keep our view aligned with theirs, even when `state`
        // has been reordered in ways that would break raw EncodeDiff.
        _view = _view is null ? _clone(state) : _decodeDiff(_view, bytes);
        // Register the new view so the next EncodeDiff sees the right baseline (looked up
        // implicitly by snapshot identity) and so tombstone pruning's cutoff tracks this
        // session. Auto-routes to state's tracker.
        Tracker.RegisterSnapshot(_view, state);
        return bytes;
    }

    /// <summary>
    /// Apply bytes received from the peer. First call expects a full encode; subsequent calls
    /// expect a diff. Returns the updated view.
    /// </summary>
    public T Decode(byte[] bytes)
    {
        _view = _view is null ? _decode(bytes) : _decodeDiff(_view, bytes);
        return _view;
    }

    /// <summary>The current view, or <c>null</c> if neither <see cref="Encode"/> nor <see cref="Decode"/> has been called.</summary>
    public T? Current => _view;
}
