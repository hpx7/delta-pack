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
        EmitInterfaceImpl(w, def);
        for (int i = 0; i < def.Fields.Length; i++)
        {
            w.Line();
            EmitPartialProperty(w, def.Fields[i], i, reg);
        }
    }

    private static void EmitInterfaceImpl(CodeWriter w, TypeDef def)
    {
        // Slot-based dirty storage: one long per declared field, compile-time slot offsets.
        // Avoids the per-mutation hash + dict insert and the per-encode hash + dict lookup
        // that a keyed scheme would incur. -1 means never dirtied.
        for (int i = 0; i < def.Fields.Length; i++)
            w.Line($"private long __dp_dirty{i} = -1;");
        w.Line();

        // IDirtyTracked backing fields + explicit impl. Explicit so the interface members
        // (Parent / ParentKey / ParentSlot) don't appear on the concrete type's IntelliSense
        // surface and can't be assigned through `instance.Parent = x` (which would corrupt the
        // parent chain). Runtime calls go through IDirtyTracked-typed variables, so the cast
        // cost is zero.
        w.Line("private DeltaPack.IDirtyTracked? __dp_parent;");
        w.Line("private object? __dp_parentKey;");
        w.Line("private int __dp_parentSlot = -1;");
        w.Line("DeltaPack.IDirtyTracked? DeltaPack.IDirtyTracked.Parent { get => __dp_parent; set => __dp_parent = value; }");
        w.Line("object? DeltaPack.IDirtyTracked.ParentKey { get => __dp_parentKey; set => __dp_parentKey = value; }");
        w.Line("int DeltaPack.IDirtyTracked.ParentSlot { get => __dp_parentSlot; set => __dp_parentSlot = value; }");
        w.Line();

        // Slot-based fast path. MarkDirty is invoked during parent-chain propagation
        // (DirtyTracking.Internal.PropagateToParent) with the child's ParentSlot — no boxing,
        // no string switch. GetDirtyVersion / IsAnyDirtyAfter are user-facing for inspection and
        // encoder-side fast-checks respectively.
        using (w.Block("bool DeltaPack.ITrackedObject.MarkDirty(int slot, long version)"))
        {
            if (def.Fields.Length == 0)
            {
                w.Line("return false;");
            }
            else
            {
                using (w.Block("switch (slot)"))
                {
                    for (int i = 0; i < def.Fields.Length; i++)
                    {
                        w.Line($"case {i}:");
                        w.Indent();
                        w.Line($"if (__dp_dirty{i} >= version) return false;");
                        w.Line($"__dp_dirty{i} = version;");
                        w.Line("return true;");
                        w.Dedent();
                    }
                    w.Line("default: return false;");
                }
            }
        }
        w.Line();

        using (w.Block("long DeltaPack.ITrackedObject.GetDirtyVersion(int slot)"))
        {
            if (def.Fields.Length == 0)
            {
                w.Line("return -1;");
            }
            else
            {
                using (w.Block("return slot switch"))
                {
                    for (int i = 0; i < def.Fields.Length; i++)
                        w.Line($"{i} => __dp_dirty{i},");
                    w.Line("_ => -1,");
                }
                w.Line(";");
            }
        }
        w.Line();

        using (w.Block("bool DeltaPack.ITrackedObject.IsAnyDirtyAfter(long version)"))
        {
            if (def.Fields.Length == 0)
            {
                w.Line("return false;");
            }
            else
            {
                var parts = new string[def.Fields.Length];
                for (int i = 0; i < def.Fields.Length; i++)
                    parts[i] = $"__dp_dirty{i} > version";
                w.Line($"return {string.Join(" || ", parts)};");
            }
        }
    }

    private static void EmitPartialProperty(CodeWriter w, FieldModel f, int slot, ModelRegistry reg)
    {
        var declared = ExpressionRenderer.CSharpType(f.Type, reg);
        var backing = "__dp_" + char.ToLowerInvariant(f.Name[0]) + f.Name.Substring(1);
        var name = f.Name;
        var defaultInit = ExpressionRenderer.DefaultInitializer(f.Type, reg);
        var trackable = ExpressionRenderer.ChildIsTrackable(f.Type, reg);

        w.Line($"private {declared} {backing} = {defaultInit};");

        using (w.Block($"public partial {declared} {name}"))
        {
            if (trackable)
            {
                // Re-establish parent on first access (idempotent — costs two assignments).
                using (w.Block("get"))
                {
                    w.Line($"if ({backing} is DeltaPack.IDirtyTracked __t && !object.ReferenceEquals(__t.Parent, this))");
                    w.Line($"    DeltaPack.DirtyTracking.Internal.ReparentToObject(__t, this, {slot});");
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
                    w.Line($"    DeltaPack.DirtyTracking.Internal.Detach(__old);");
                }
                w.Line($"{backing} = value;");
                if (trackable)
                {
                    w.Line($"if ({backing} is DeltaPack.IDirtyTracked __new)");
                    w.Line($"    DeltaPack.DirtyTracking.Internal.ReparentToObject(__new, this, {slot});");
                }
                // Fast path: if this slot is already dirty past every pending baseline, the
                // next EncodeDiff will emit the field regardless of what we record here. Skip
                // the atomic NextVersion + parent walk — both are observable-free in this
                // state. The detach/reparent above still has to run (structural child->parent
                // correctness for future propagations), but version bookkeeping is pure cost.
                w.Line($"if (__dp_dirty{slot} > DeltaPack.DirtyTracking.Internal.LatestBaseline) return;");
                w.Line("var __v = DeltaPack.DirtyTracking.Internal.NextVersion();");
                w.Line($"__dp_dirty{slot} = __v;");
                w.Line("DeltaPack.DirtyTracking.Internal.PropagateToParent(this, __v);");
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

}
