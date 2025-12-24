using Shooter.Server;

var simulatePacketLoss = args.Contains("--simulate-loss");

Console.WriteLine("Delta-Pack Shooter Server");
Console.WriteLine("=========================");

var server = new GameServer(simulatePacketLoss);
server.Start();
