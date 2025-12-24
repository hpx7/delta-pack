using System.Net;
using System.Net.Sockets;
using DeltaPack;
using LiteNetLib;
using LiteNetLib.Utils;
using Shooter.Shared;

namespace Shooter.Client;

public record NetworkStats(int Ping, float PacketLoss, float BandwidthKBps, int DelayMs);

public class GameClient : INetEventListener
{
    private readonly NetManager _netManager;
    private NetPeer? _serverPeer;

    private readonly DeltaPackCodec<ClientMessage> _clientCodec = new();
    private readonly DeltaPackCodec<StateMessage> _stateCodec = new();

    private readonly string _playerName;
    private readonly Dictionary<uint, StateMessage> _stateHistory = new();
    private const uint MaxClientHistory = 75;  // ~1.5 seconds at 50Hz
    private uint _lastMessageTick;

    // Interpolation buffer for smooth rendering
    private readonly InterpolationBuffer _interpolationBuffer = new();
    private readonly StatsTracker _stats = new();

    // Input redundancy
    private readonly List<TimestampedInput> _inputHistory = new();
    private const int InputRedundancy = 6;  // Send last 6 inputs (~120ms at 50Hz)
    private uint _inputTick;

    public string? PlayerId { get; private set; }
    public GameState? CurrentState => _interpolationBuffer.LatestState;
    public bool IsConnected => _serverPeer?.ConnectionState == ConnectionState.Connected;
    public bool HasJoined => PlayerId != null;

    /// <summary>
    /// Get the local player from current state, or null if not available.
    /// </summary>
    public Player? LocalPlayer =>
        PlayerId != null && CurrentState?.Players.TryGetValue(PlayerId, out var p) == true ? p : null;

    /// <summary>
    /// Sample interpolation buffer for smooth rendering.
    /// Returns two states to interpolate between and the interpolation factor.
    /// </summary>
    public (GameState? From, GameState? To, float T) SampleStates()
        => _interpolationBuffer.Sample();

    // Network stats
    public NetworkStats Stats
    {
        get
        {
            _stats.UpdateBandwidth(_serverPeer?.Statistics.BytesReceived ?? 0);
            return new NetworkStats(
                _stats.Ping,
                _stats.PacketLoss,
                _stats.BandwidthKBps,
                _interpolationBuffer.DelayMs
            );
        }
    }

    public GameClient(string playerName, bool simulatePacketLoss = false)
    {
        _playerName = playerName;
        _netManager = new NetManager(this)
        {
            AutoRecycle = true,
            UpdateTime = 15,
            EnableStatistics = true
        };

        if (simulatePacketLoss)
        {
            _netManager.SimulatePacketLoss = true;
            _netManager.SimulationPacketLossChance = 30;  // 30% loss
            _netManager.SimulateLatency = true;
            _netManager.SimulationMinLatency = 100;
            _netManager.SimulationMaxLatency = 200;
            Console.WriteLine("Network simulation enabled: 30% packet loss, 100-200ms latency");
        }
    }

    public void Connect(string host)
    {
        _netManager.Start();
        var writer = new NetDataWriter();
        writer.Put(Constants.ConnectionKey);
        _netManager.Connect(host, Constants.ServerPort, writer);
    }

    public void Disconnect()
    {
        _serverPeer?.Disconnect();
        _netManager.Stop();
    }

    public void PollEvents() => _netManager.PollEvents();

    public void SendInput(ClientInput input)
    {
        if (_serverPeer == null || !HasJoined)
            return;

        // Add to history with incrementing tick
        _inputTick++;
        _inputHistory.Add(new TimestampedInput { Tick = _inputTick, Input = input });

        // Keep only last N inputs
        if (_inputHistory.Count > InputRedundancy)
            _inputHistory.RemoveRange(0, _inputHistory.Count - InputRedundancy);

        // Send all recent inputs (redundancy)
        var message = new InputMessage
        {
            LastReceivedTick = _lastMessageTick,
            Inputs = _inputHistory.ToList()
        };
        _serverPeer.Send(_clientCodec.Encode(message), DeliveryMethod.Sequenced);
    }

    private void HandleMessage(byte[] data)
    {
        try
        {
            // Read baseline tick prefix (4 bytes)
            var reader = new NetDataReader(data);
            var baselineTick = (uint)reader.GetInt();
            var payload = reader.GetRemainingBytes();

            StateMessage message;

            if (baselineTick == 0)
            {
                // Full state
                message = _stateCodec.Decode(payload);
            }
            else
            {
                // Diff state - look up baseline in history
                if (!_stateHistory.TryGetValue(baselineTick, out var baseline))
                {
                    var range = _stateHistory.Count > 0
                        ? $"{_stateHistory.Keys.Min()}-{_stateHistory.Keys.Max()}"
                        : "empty";
                    Console.WriteLine($"DROP: Baseline {baselineTick} not in history (have {range})");
                    return;
                }
                message = _stateCodec.DecodeDiff(baseline, payload);
            }

            // Track packet loss
            _stats.OnPacketReceived(message.Tick, _lastMessageTick);

            HandleStateMessage(message);

            // Store in history for future diffs (must clone to avoid mutation)
            _stateHistory[message.Tick] = _stateCodec.Clone(message);
            _lastMessageTick = message.Tick;

            // Prune old history
            var minTick = message.Tick - MaxClientHistory;
            foreach (var tick in _stateHistory.Keys.Where(t => t < minTick).ToList())
                _stateHistory.Remove(tick);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error handling message: {ex.Message}");
        }
    }

    private void HandleStateMessage(StateMessage stateMsg)
    {
        // Set player ID from first message
        if (PlayerId == null)
        {
            PlayerId = stateMsg.PlayerId;
            Console.WriteLine($"Joined as {PlayerId}");
        }

        // Add to interpolation buffer
        _interpolationBuffer.AddState(stateMsg.State, stateMsg.Tick);
    }

    // INetEventListener implementation

    public void OnPeerConnected(NetPeer peer)
    {
        _serverPeer = peer;
        Console.WriteLine("Connected to server");

        // Send join request
        var joinRequest = new JoinRequest { PlayerName = _playerName };
        peer.Send(_clientCodec.Encode(joinRequest), DeliveryMethod.ReliableOrdered);
    }

    public void OnPeerDisconnected(NetPeer peer, DisconnectInfo disconnectInfo)
    {
        Console.WriteLine($"Disconnected: {disconnectInfo.Reason}");
        _serverPeer = null;
        PlayerId = null;
        _stateHistory.Clear();
        _interpolationBuffer.Clear();
        _stats.Clear();
        _lastMessageTick = 0;
    }

    public void OnNetworkReceive(NetPeer peer, NetPacketReader reader, byte channelNumber, DeliveryMethod deliveryMethod)
    {
        var data = new byte[reader.AvailableBytes];
        reader.GetBytes(data, data.Length);
        HandleMessage(data);
    }

    public void OnNetworkError(IPEndPoint endPoint, SocketError socketError)
        => Console.WriteLine($"Network error: {socketError}");

    // Client doesn't accept connections
    public void OnConnectionRequest(ConnectionRequest request)
        => request.Reject();

    public void OnNetworkReceiveUnconnected(IPEndPoint remoteEndPoint, NetPacketReader reader, UnconnectedMessageType messageType)
    { }

    public void OnNetworkLatencyUpdate(NetPeer peer, int latency)
        => _stats.OnLatencyUpdate(latency * 2);  // LiteNetLib reports one-way, double for RTT
}
