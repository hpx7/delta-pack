using Raylib_cs;
using Shooter.Client;
using Shooter.Shared;

// Parse arguments
var simulatePacketLoss = args.Contains("--simulate-loss");
var otherArgs = args.Where(a => !a.StartsWith("--")).ToArray();
var host = otherArgs.Length > 0 ? otherArgs[0] : "127.0.0.1";
var playerName = otherArgs.Length > 1 ? otherArgs[1] : $"Player{Random.Shared.Next(1000)}";

Console.WriteLine("Delta-Pack Shooter Client");
Console.WriteLine("=========================");
Console.WriteLine($"Connecting to {host}:{Constants.ServerPort} as {playerName}");

// Initialize
var renderer = new Renderer();
var client = new GameClient(playerName, simulatePacketLoss);

renderer.Initialize();
client.Connect(host);

// Input state
var lastInputTime = DateTime.UtcNow;
var inputInterval = TimeSpan.FromMilliseconds(1000.0 / Constants.TickRate);
uint shootSeq = 0;  // Increments on each click

// Main loop
while (!renderer.ShouldClose())
{
    client.PollEvents();

    // Increment shoot sequence on click
    if (Raylib.IsMouseButtonPressed(MouseButton.Left))
        shootSeq++;

    // Send input at fixed rate
    if (client.HasJoined && DateTime.UtcNow - lastInputTime >= inputInterval)
    {
        lastInputTime = DateTime.UtcNow;

        var input = new ClientInput
        {
            Up = Raylib.IsKeyDown(KeyboardKey.W),
            Down = Raylib.IsKeyDown(KeyboardKey.S),
            Left = Raylib.IsKeyDown(KeyboardKey.A),
            Right = Raylib.IsKeyDown(KeyboardKey.D),
            ShootSeq = shootSeq,
            AimAngle = CalculateAimAngle(client)
        };

        client.SendInput(input);
    }

    // Render with interpolation buffer
    var (from, to, t) = client.SampleStates();
    renderer.DrawFrame(from, to, t, client.PlayerId, client.Stats);
}

client.Disconnect();
renderer.Close();

float CalculateAimAngle(GameClient client)
{
    var player = client.LocalPlayer;
    if (player == null)
        return 0;

    var mouse = Raylib.GetMousePosition();
    return MathF.Atan2(mouse.Y - player.Position.Y, mouse.X - player.Position.X);
}
