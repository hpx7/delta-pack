using System.Numerics;
using Raylib_cs;
using Shooter.Shared;

namespace Shooter.Client;

public class Renderer
{
    private const int WindowWidth = Constants.WorldWidth;
    private const int WindowHeight = Constants.WorldHeight;

    public void Initialize()
    {
        Raylib.InitWindow(WindowWidth, WindowHeight, "Delta-Pack Shooter");
        Raylib.SetTargetFPS(60);
    }

    public void Close() => Raylib.CloseWindow();
    public bool ShouldClose() => Raylib.WindowShouldClose();

    // --- Main render ---

    public void DrawFrame(GameState? from, GameState? to, float t, string? localPlayerId, NetworkStats stats)
    {
        Raylib.BeginDrawing();
        Raylib.ClearBackground(new Color(30, 30, 40, 255));

        if (to == null)
        {
            DrawCenteredText("Connecting...", 24, Color.White);
        }
        else
        {
            var localPlayer = localPlayerId != null ? to.Players.GetValueOrDefault(localPlayerId) : null;
            DrawWorld(from, to, t, localPlayerId, localPlayer?.ShootCooldown ?? 0f);
            DrawScoreboard(to, localPlayerId);
            DrawHUD(to);
        }

        DrawNetworkStats(stats);
        Raylib.EndDrawing();
    }

    // --- World rendering ---

    private void DrawWorld(GameState? prev, GameState curr, float t, string? localId, float shootCooldown)
    {
        foreach (var bullet in curr.Bullets.Values)
        {
            var pos = InterpolateBullet(prev, bullet, t);
            DrawBullet(pos);
        }

        foreach (var player in curr.Players.Values)
        {
            var prevPlayer = prev?.Players.GetValueOrDefault(player.Id);
            var pos = InterpolatePlayer(prevPlayer, player, t);
            var isLocal = player.Id == localId;

            DrawPlayer(pos, player, isLocal, shootCooldown);

            if (!player.IsAlive && isLocal)
                DrawCenteredText($"Respawning in {player.RespawnTimer:F1}s", 28, Color.Red, yOffset: -50);
        }
    }

    private static Vec2 InterpolatePlayer(Player? prev, Player curr, float t)
    {
        if (prev == null) return curr.Position;
        // Skip interpolation if just respawned
        if (!prev.IsAlive && curr.IsAlive) return curr.Position;
        return Vec2.Lerp(prev.Position, curr.Position, t);
    }

    private static Vec2 InterpolateBullet(GameState? prev, Bullet curr, float t)
    {
        var prevBullet = prev?.Bullets.GetValueOrDefault(curr.Id);
        return prevBullet != null ? Vec2.Lerp(prevBullet.Position, curr.Position, t) : curr.Position;
    }

    // --- Entity drawing ---

    private static void DrawPlayer(Vec2 pos, Player player, bool isLocal, float shootCooldown)
    {
        var baseColor = GetPlayerColor(player.Color);
        var alpha = (byte)(player.IsAlive ? 255 : 80);
        var color = new Color(baseColor.R, baseColor.G, baseColor.B, alpha);

        // Body
        Raylib.DrawCircle((int)pos.X, (int)pos.Y, Constants.PlayerRadius, color);

        // Name
        var nameWidth = Raylib.MeasureText(player.Name, 14);
        Raylib.DrawText(player.Name, (int)pos.X - nameWidth / 2, (int)(pos.Y + Constants.PlayerRadius + 5), 14, Color.White);

        if (!player.IsAlive) return;

        // Aim line
        var aimEnd = pos + new Vec2(MathF.Cos(player.AimAngle), MathF.Sin(player.AimAngle)) * (Constants.PlayerRadius + 15);
        Raylib.DrawLineEx(new Vector2(pos.X, pos.Y), new Vector2(aimEnd.X, aimEnd.Y), 3, Color.White);

        // Health bar
        DrawHealthBar(pos + new Vec2(0, -Constants.PlayerRadius - 12), player.Health);

        // Local player cooldown ring
        if (isLocal)
            DrawCooldownRing(pos, shootCooldown);
    }

    private static void DrawBullet(Vec2 pos)
    {
        Raylib.DrawCircle((int)pos.X, (int)pos.Y, Constants.BulletRadius, Color.Yellow);
    }

    private static void DrawHealthBar(Vec2 center, uint health)
    {
        const int width = 40, height = 6;
        var x = (int)(center.X - width / 2);
        var y = (int)center.Y;

        var healthPct = health / (float)Constants.PlayerMaxHealth;
        var healthColor = health > 60 ? Color.Green : health > 30 ? Color.Yellow : Color.Red;

        Raylib.DrawRectangle(x - 1, y - 1, width + 2, height + 2, Color.Black);
        Raylib.DrawRectangle(x, y, (int)(width * healthPct), height, healthColor);
    }

    private static void DrawCooldownRing(Vec2 pos, float shootCooldown)
    {
        var radius = Constants.PlayerRadius + 5;
        var progress = 1f - Math.Clamp(shootCooldown / Constants.ShootCooldown, 0f, 1f);

        if (shootCooldown > 0)
        {
            var color = new Color((byte)(255 * (1 - progress)), (byte)(150 + 105 * progress), (byte)50, (byte)255);
            Raylib.DrawRing(new Vector2(pos.X, pos.Y), radius - 2, radius + 2, -90f, -90f + 360f * progress, 36, color);
        }
        else
        {
            Raylib.DrawCircleLines((int)pos.X, (int)pos.Y, radius, Color.White);
        }
    }

    // --- UI ---

    private static void DrawScoreboard(GameState state, string? localId)
    {
        Raylib.DrawText("SCOREBOARD", 10, 10, 16, Color.White);

        var y = 30;
        foreach (var player in state.Players.Values.OrderByDescending(p => p.Score).ThenBy(p => p.Deaths))
        {
            var color = player.Id == localId ? Color.Yellow : Color.LightGray;
            Raylib.DrawText($"{player.Name}: {player.Score} kills, {player.Deaths} deaths", 10, y, 14, color);
            y += 18;
        }
    }

    private static void DrawHUD(GameState state)
    {
        Raylib.DrawText($"Tick: {state.Tick}", WindowWidth - 100, 10, 14, Color.Gray);
        Raylib.DrawText("WASD: Move | Click: Shoot", 10, WindowHeight - 25, 14, Color.Gray);
    }

    private static void DrawNetworkStats(NetworkStats stats)
    {
        const int x = WindowWidth - 120, lineHeight = 16;
        var y = 30;

        Raylib.DrawRectangle(x - 5, y - 5, 115, 74, new Color(0, 0, 0, 150));

        DrawStat($"Ping: {stats.Ping}ms", x, ref y, lineHeight, stats.Ping < 50 ? Color.Green : stats.Ping < 100 ? Color.Yellow : Color.Red);
        DrawStat($"Loss: {stats.PacketLoss:F0}%", x, ref y, lineHeight, stats.PacketLoss < 5 ? Color.Green : stats.PacketLoss < 20 ? Color.Yellow : Color.Red);
        DrawStat($"Delay: {stats.DelayMs}ms", x, ref y, lineHeight, stats.DelayMs < 75 ? Color.Green : stats.DelayMs < 150 ? Color.Yellow : Color.Red);
        DrawStat($"BW: {stats.BandwidthKBps:F1} KB/s", x, ref y, lineHeight, Color.LightGray);
    }

    private static void DrawStat(string text, int x, ref int y, int lineHeight, Color color)
    {
        Raylib.DrawText(text, x, y, 14, color);
        y += lineHeight;
    }

    // --- Helpers ---

    private static void DrawCenteredText(string text, int fontSize, Color color, int yOffset = 0)
    {
        var width = Raylib.MeasureText(text, fontSize);
        Raylib.DrawText(text, WindowWidth / 2 - width / 2, WindowHeight / 2 + yOffset, fontSize, color);
    }

    private static Color GetPlayerColor(PlayerColor color) => color switch
    {
        PlayerColor.Red => new Color(220, 80, 80, 255),
        PlayerColor.Blue => new Color(80, 120, 220, 255),
        PlayerColor.Green => new Color(80, 200, 80, 255),
        PlayerColor.Yellow => new Color(220, 200, 80, 255),
        PlayerColor.Purple => new Color(180, 80, 220, 255),
        PlayerColor.Orange => new Color(220, 140, 60, 255),
        _ => Color.White
    };
}
