namespace Shooter.Client;

/// <summary>
/// Tracks network statistics: ping, packet loss, and bandwidth.
/// </summary>
public class StatsTracker
{
    // Packet loss tracking (rolling window)
    private readonly Queue<(int Received, int Gaps)> _lossWindow = new();
    private const int LossWindowSize = 100;  // ~2 seconds at 50Hz
    private int _totalReceived;
    private int _totalGaps;

    // Bandwidth tracking
    private long _lastBytesReceived;
    private DateTime _lastBandwidthSample = DateTime.UtcNow;
    private float _bandwidthKBps;

    // Ping (set externally from network callback)
    public int Ping { get; private set; }

    public float PacketLoss => _totalReceived + _totalGaps > 0
        ? 100f * _totalGaps / (_totalReceived + _totalGaps)
        : 0f;

    public float BandwidthKBps => _bandwidthKBps;

    /// <summary>
    /// Call when a packet is received to track gaps (packet loss).
    /// </summary>
    public void OnPacketReceived(uint currentTick, uint lastTick)
    {
        var gaps = lastTick > 0 ? (int)(currentTick - lastTick - 1) : 0;

        _lossWindow.Enqueue((1, gaps));
        _totalReceived++;
        _totalGaps += gaps;

        while (_lossWindow.Count > LossWindowSize)
        {
            var old = _lossWindow.Dequeue();
            _totalReceived -= old.Received;
            _totalGaps -= old.Gaps;
        }
    }

    /// <summary>
    /// Call from network latency callback.
    /// </summary>
    public void OnLatencyUpdate(int latencyMs)
    {
        Ping = latencyMs;
    }

    /// <summary>
    /// Call periodically to update bandwidth measurement.
    /// </summary>
    public void UpdateBandwidth(long totalBytesReceived)
    {
        var now = DateTime.UtcNow;
        var elapsed = (float)(now - _lastBandwidthSample).TotalSeconds;

        if (elapsed >= 0.5f)
        {
            _bandwidthKBps = (totalBytesReceived - _lastBytesReceived) / 1024f / elapsed;
            _lastBytesReceived = totalBytesReceived;
            _lastBandwidthSample = now;
        }
    }

    public void Clear()
    {
        _lossWindow.Clear();
        _totalReceived = 0;
        _totalGaps = 0;
        _lastBytesReceived = 0;
        _bandwidthKBps = 0;
        Ping = 0;
    }
}
