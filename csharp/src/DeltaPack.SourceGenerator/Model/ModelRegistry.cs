using System.Collections.Generic;
using System.Collections.Immutable;

namespace DeltaPack.SourceGenerator.Model;

/// <summary>
/// Compilation-wide index of [DeltaPack] types plus transitively referenced enums.
/// Allows emitters to resolve a <see cref="TypeRef.Reference"/> back to a <see cref="TypeDef"/>.
/// </summary>
internal sealed class ModelRegistry
{
    private readonly ImmutableDictionary<string, TypeDef> _byName;

    public ModelRegistry(ImmutableDictionary<string, TypeDef> byName) => _byName = byName;

    public IEnumerable<TypeDef> All => _byName.Values;

    public TypeDef? Lookup(string fullyQualifiedName)
        => _byName.TryGetValue(fullyQualifiedName, out var d) ? d : null;
}
