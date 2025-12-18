using Game2D;

var server = new GameServer();

// Handle graceful shutdown
Console.CancelKeyPress += (_, e) =>
{
    e.Cancel = true;
    server.Stop();
    Environment.Exit(0);
};

AppDomain.CurrentDomain.ProcessExit += (_, _) =>
{
    server.Stop();
};

server.Start();

// Keep the application running
Console.WriteLine("Press Ctrl+C to stop the server");
Thread.Sleep(Timeout.Infinite);
