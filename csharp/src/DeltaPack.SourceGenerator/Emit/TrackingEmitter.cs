using DeltaPack.SourceGenerator.Model;

namespace DeltaPack.SourceGenerator.Emit;

/// <summary>
/// Emits the <c>IDirtyTracked</c> interface implementation and partial-property
/// bodies for <c>[DeltaPackTracked]</c> classes. Appended into the same partial
/// class as the regular emitter output.
/// </summary>
internal static class TrackingEmitter
{
    public static void EmitTrackingMembers(CodeWriter w, TypeDef def, ModelRegistry reg)
    {
        EmitInterfaceImpl(w);
        w.Line();
        EmitSetSnapshotVersionRecursive(w, def, reg);
        foreach (var f in def.Fields)
        {
            w.Line();
            EmitPartialProperty(w, f, reg);
        }
    }

    private static void EmitSetSnapshotVersionRecursive(CodeWriter w, TypeDef def, ModelRegistry reg)
    {
        using (w.Block("void DeltaPack.IDirtyTracked.SetSnapshotVersionRecursive(long version)"))
        {
            w.Line("SnapshotVersion = version;");
            foreach (var f in def.Fields)
            {
                if (!ChildIsTrackable(f.Type, reg)) continue;
                // Field accessor: use the partial property which re-establishes parent on get.
                // The null-check covers Optional<T> nullable references.
                w.Line($"if ({f.Name} is DeltaPack.IDirtyTracked __t_{f.Name}) __t_{f.Name}.SetSnapshotVersionRecursive(version);");
            }
        }
    }

    private static void EmitInterfaceImpl(CodeWriter w)
    {
        w.Line("private readonly System.Collections.Generic.Dictionary<string, long> __dpDirty = new();");
        w.Line();
        w.Line("System.Collections.Generic.IReadOnlyDictionary<string, long>? DeltaPack.IDirtyTracked.DirtyFields => __dpDirty;");
        w.Line("System.Collections.Generic.IReadOnlyDictionary<int, long>? DeltaPack.IDirtyTracked.DirtyIndices => null;");
        w.Line("public long SnapshotVersion { get; set; } = -1;");
        w.Line("public DeltaPack.IDirtyTracked? Parent { get; set; }");
        w.Line("public object? ParentKey { get; set; }");
        w.Line();
        using (w.Block("bool DeltaPack.IDirtyTracked.MarkDirty(object key, long version)"))
        {
            w.Line("if (key is not string __s) return false;");
            w.Line("if (__dpDirty.TryGetValue(__s, out var __existing) && __existing >= version) return false;");
            w.Line("__dpDirty[__s] = version;");
            w.Line("return true;");
        }
    }

    private static void EmitPartialProperty(CodeWriter w, FieldModel f, ModelRegistry reg)
    {
        var declared = ExpressionRenderer.CSharpType(f.Type, reg);
        var backing = "__dp_" + char.ToLowerInvariant(f.Name[0]) + f.Name.Substring(1);
        var name = f.Name;
        var defaultInit = ExpressionRenderer.DefaultInitializer(f.Type, reg);
        var trackable = ChildIsTrackable(f.Type, reg);

        w.Line($"private {declared} {backing} = {defaultInit};");

        using (w.Block($"public partial {declared} {name}"))
        {
            if (trackable)
            {
                // Re-establish parent on first access (idempotent — costs two assignments).
                using (w.Block("get"))
                {
                    w.Line($"if ({backing} is DeltaPack.IDirtyTracked __t && !object.ReferenceEquals(__t.Parent, this))");
                    w.Line($"    DeltaPack.DirtyTracking.Reparent(__t, this, \"{name}\");");
                    w.Line($"return {backing};");
                }
            }
            else
            {
                w.Line($"get => {backing};");
            }

            using (w.Block("set"))
            {
                EmitSetterEqualityShortCircuit(w, f.Type, backing, "value");
                if (trackable)
                {
                    w.Line($"if ({backing} is DeltaPack.IDirtyTracked __old && object.ReferenceEquals(__old.Parent, this))");
                    w.Line($"    DeltaPack.DirtyTracking.Detach(__old);");
                }
                w.Line($"{backing} = value;");
                if (trackable)
                {
                    w.Line($"if ({backing} is DeltaPack.IDirtyTracked __new)");
                    w.Line($"    DeltaPack.DirtyTracking.Reparent(__new, this, \"{name}\");");
                }
                w.Line("var __v = DeltaPack.DirtyTracking.NextVersion();");
                w.Line($"__dpDirty[\"{name}\"] = __v;");
                w.Line("DeltaPack.DirtyTracking.PropagateToParent(this, __v);");
            }
        }
    }

    private static void EmitSetterEqualityShortCircuit(CodeWriter w, TypeRef t, string backing, string value)
    {
        // Avoid bumping the global version when the new value equals the current one.
        // This invariant is what guarantees byte-parity with the untracked encoder for
        // common cases — without it, set-to-same would record a spurious dirty entry.
        switch (t.Kind)
        {
            case TypeKind.String:
            case TypeKind.Boolean:
            case TypeKind.Int:
                w.Line($"if ({backing} == {value}) return;");
                break;
            case TypeKind.Float:
                // For quantized vs full floats, exact equality is the right check inside the setter
                // (the user is assigning a literal value; quantization only matters at encode time).
                w.Line($"if ({backing} == {value}) return;");
                break;
            case TypeKind.Reference:
                // Enums are value-types with == support; objects use ReferenceEquals as a cheap check.
                w.Line($"if (object.ReferenceEquals({backing}, {value})) return;");
                break;
            default:
                // Arrays / records / optionals: ReferenceEquals is a cheap fast-path; deep equality
                // is too expensive to do per setter call.
                w.Line($"if (object.ReferenceEquals({backing}, {value})) return;");
                break;
        }
    }

    /// <summary>
    /// True if a value of this type may implement <see cref="DeltaPack.IDirtyTracked"/> and therefore
    /// participates in parent-wiring. Used to decide whether the setter emits Detach/Reparent.
    /// </summary>
    private static bool ChildIsTrackable(TypeRef t, ModelRegistry reg)
    {
        switch (t.Kind)
        {
            case TypeKind.Array:
            case TypeKind.Record:
                return t.IsTracked;
            case TypeKind.Reference:
                {
                    var def = reg.Lookup(t.ReferenceName!);
                    if (def is null || def.Kind == TypeDefKind.Enum) return false;
                    return def.IsTracked;
                }
            case TypeKind.Optional:
                return ChildIsTrackable(t.ElementType!, reg);
            default:
                return false;
        }
    }
}
