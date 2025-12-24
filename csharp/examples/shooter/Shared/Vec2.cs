using DeltaPack;

namespace Shooter.Shared;

public struct Vec2
{
    [DeltaPackPrecision(0.1)]
    public float X;

    [DeltaPackPrecision(0.1)]
    public float Y;

    public Vec2(float x, float y) { X = x; Y = y; }

    public static Vec2 operator +(Vec2 a, Vec2 b) => new(a.X + b.X, a.Y + b.Y);
    public static Vec2 operator -(Vec2 a, Vec2 b) => new(a.X - b.X, a.Y - b.Y);
    public static Vec2 operator *(Vec2 v, float s) => new(v.X * s, v.Y * s);
    public static Vec2 operator *(float s, Vec2 v) => new(v.X * s, v.Y * s);
    public static Vec2 operator /(Vec2 v, float s) => new(v.X / s, v.Y / s);

    public readonly float LengthSquared() => X * X + Y * Y;
    public readonly float Length() => MathF.Sqrt(LengthSquared());
    public readonly Vec2 Normalized() => this / Length();

    public static Vec2 Lerp(Vec2 a, Vec2 b, float t) => a + (b - a) * t;

    public override readonly string ToString() => $"<{X}, {Y}>";
}
