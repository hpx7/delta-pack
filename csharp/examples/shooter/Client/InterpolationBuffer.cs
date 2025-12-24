using Shooter.Shared;

namespace Shooter.Client;

/// <summary>
/// Buffers game states and provides smooth interpolation.
/// Uses playback rate adjustment to maintain target buffer depth.
/// </summary>
public class InterpolationBuffer
{
    // Playback rate adjustment
    private const double RateAdjustment = 0.05;  // 5% speed change per tick of error
    private const double MinRate = 0.9;
    private const double MaxRate = 1.1;

    // Adaptive delay
    private const double DelayIncreaseOnStall = 1.0;  // Ticks to add on stall
    private const double DelayDecreaseRate = 0.002;   // Ticks per frame to decrease

    private readonly Queue<(uint Tick, GameState State)> _buffer = new();
    private readonly int _maxSize;
    private readonly double _tickDuration;
    private readonly double _minDelayTicks;
    private readonly double _maxDelayTicks;

    private double _targetDelayTicks;
    private double _renderTick;
    private double _lastTime;
    private double _smoothedDepth;
    private bool _initialized;

    public InterpolationBuffer(int maxSize = 25, double minDelaySeconds = 0.05, double maxDelaySeconds = 0.25)
    {
        _maxSize = maxSize;
        _tickDuration = 1.0 / Constants.TickRate;
        _minDelayTicks = minDelaySeconds / _tickDuration;
        _maxDelayTicks = maxDelaySeconds / _tickDuration;
        _targetDelayTicks = _minDelayTicks;
    }

    public void AddState(GameState state, uint tick)
    {
        _buffer.Enqueue((tick, state));
        while (_buffer.Count > _maxSize)
            _buffer.Dequeue();
    }

    public (GameState? From, GameState? To, float T) Sample()
    {
        if (_buffer.Count < 2)
            return (_buffer.LastOrDefault().State, _buffer.LastOrDefault().State, 1f);

        var now = DateTime.UtcNow.Ticks / (double)TimeSpan.TicksPerSecond;
        var latestTick = _buffer.Last().Tick;
        var oldestTick = _buffer.First().Tick;

        if (!_initialized)
        {
            // Wait for buffer to fill
            var buffered = latestTick - oldestTick;
            if (buffered < _targetDelayTicks)
                return (_buffer.Last().State, _buffer.Last().State, 1f);

            _renderTick = latestTick - _targetDelayTicks;
            _smoothedDepth = _targetDelayTicks;
            _lastTime = now;
            _initialized = true;
        }
        else
        {
            var elapsed = now - _lastTime;
            _lastTime = now;

            // Adjust playback rate to maintain target depth
            var depth = latestTick - _renderTick;
            var rate = 1.0 + (depth - _targetDelayTicks) * RateAdjustment;
            rate = Math.Clamp(rate, MinRate, MaxRate);

            _renderTick += (elapsed / _tickDuration) * rate;
            _renderTick = Math.Max(_renderTick, oldestTick);  // Don't go before oldest

            // Adaptive delay
            if (depth > _targetDelayTicks * 0.8)
                _targetDelayTicks = Math.Max(_minDelayTicks, _targetDelayTicks - DelayDecreaseRate);

            _smoothedDepth += (depth - _smoothedDepth) * 0.05;
        }

        // Find bracketing states
        (uint Tick, GameState State)? from = null;
        (uint Tick, GameState State)? to = null;

        foreach (var entry in _buffer)
        {
            if (entry.Tick > _renderTick)
            {
                to = entry;
                break;
            }
            from = entry;
        }

        // Stall: renderTick caught up to latest
        if (to == null)
        {
            _targetDelayTicks = Math.Min(_maxDelayTicks, _targetDelayTicks + DelayIncreaseOnStall);
            // Hold last state (no extrapolation)
            var last = _buffer.Last().State;
            return (last, last, 1f);
        }

        if (from == null)
        {
            // Before first state
            return (to.Value.State, to.Value.State, 0f);
        }

        var t = (float)((_renderTick - from.Value.Tick) / (to.Value.Tick - from.Value.Tick));
        return (from.Value.State, to.Value.State, t);
    }

    public GameState? LatestState => _buffer.Count > 0 ? _buffer.Last().State : null;
    public int DelayMs => (int)(_smoothedDepth * _tickDuration * 1000);

    public void Clear()
    {
        _buffer.Clear();
        _renderTick = 0;
        _lastTime = 0;
        _smoothedDepth = 0;
        _initialized = false;
        _targetDelayTicks = _minDelayTicks;
    }
}
