using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;

namespace DeltaPack.SourceGenerator.Model;

internal readonly struct EquatableArray<T> : IEquatable<EquatableArray<T>>, IEnumerable<T>
    where T : IEquatable<T>
{
    public static readonly EquatableArray<T> Empty = new(ImmutableArray<T>.Empty);

    private readonly ImmutableArray<T> _array;

    public EquatableArray(ImmutableArray<T> array) => _array = array;

    public ImmutableArray<T> AsImmutableArray() => _array.IsDefault ? ImmutableArray<T>.Empty : _array;

    public int Length => _array.IsDefault ? 0 : _array.Length;

    public T this[int i] => _array[i];

    public bool Equals(EquatableArray<T> other) => AsSpan().SequenceEqual(other.AsSpan());

    public override bool Equals(object? obj) => obj is EquatableArray<T> other && Equals(other);

    public override int GetHashCode()
    {
        if (_array.IsDefault) return 0;
        unchecked
        {
            int hash = 17;
            foreach (var item in _array)
                hash = hash * 31 + (item?.GetHashCode() ?? 0);
            return hash;
        }
    }

    private ReadOnlySpan<T> AsSpan() => _array.IsDefault ? ReadOnlySpan<T>.Empty : _array.AsSpan();

    public IEnumerator<T> GetEnumerator() => AsImmutableArray().AsEnumerable().GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();

    public static bool operator ==(EquatableArray<T> left, EquatableArray<T> right) => left.Equals(right);
    public static bool operator !=(EquatableArray<T> left, EquatableArray<T> right) => !left.Equals(right);
}

internal static class EquatableArrayExtensions
{
    public static EquatableArray<T> ToEquatableArray<T>(this IEnumerable<T> source) where T : IEquatable<T>
        => new(source.ToImmutableArray());
}
