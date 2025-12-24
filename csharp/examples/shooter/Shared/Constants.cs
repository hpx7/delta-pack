namespace Shooter.Shared;

public static class Constants
{
    // Network
    public const int ServerPort = 9050;
    public const string ConnectionKey = "shooter-v1";

    // Game loop
    public const int TickRate = 50;  // Ticks per second
    public const float TickDuration = 1f / TickRate;

    // World
    public const int WorldWidth = 800;
    public const int WorldHeight = 600;

    // Player
    public const float PlayerRadius = 20f;
    public const float PlayerSpeed = 200f;
    public const int PlayerMaxHealth = 100;
    public const float RespawnDelay = 3f;

    // Bullet
    public const float BulletRadius = 5f;
    public const float BulletSpeed = 500f;
    public const float BulletTimeToLive = 2f;
    public const int BulletDamage = 25;
    public const float ShootCooldown = 0.25f;  // 4 shots per second max

    // Delta encoding
    public const uint MaxHistoryTicks = 150;  // ~3 seconds at 50Hz
}
