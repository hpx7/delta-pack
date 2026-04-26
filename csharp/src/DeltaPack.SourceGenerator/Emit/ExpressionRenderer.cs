using System;
using DeltaPack.SourceGenerator.Model;

namespace DeltaPack.SourceGenerator.Emit;

/// <summary>
/// Renders per-field C# expressions for each of the 7 generated operations
/// (declared type, encode, decode, equals, clone, encodeDiff, decodeDiff).
/// Mirrors the shapes emitted by <c>cli/src/codegen/csharp.ts</c>.
/// </summary>
internal static class ExpressionRenderer
{
    /// <summary>The C# type name used to declare a field or variable of this type.</summary>
    public static string CSharpType(TypeRef t, ModelRegistry reg) => t.Kind switch
    {
        TypeKind.String => "string",
        TypeKind.Boolean => "bool",
        TypeKind.Float => "float",
        TypeKind.Int => t.IntStorage.CSharpKeyword(),
        TypeKind.Array => $"DeltaPack.DPList<{CSharpType(t.ElementType!, reg)}>",
        TypeKind.Optional => OptionalDeclaredType(t.ElementType!, reg),
        TypeKind.Record => $"DeltaPack.DPDict<{CSharpType(t.KeyType!, reg)}, {CSharpType(t.ValueType!, reg)}>",
        TypeKind.Reference => t.ReferenceName!,
        _ => throw new InvalidOperationException($"Unknown type kind: {t.Kind}"),
    };

    private static string OptionalDeclaredType(TypeRef inner, ModelRegistry reg)
    {
        // Reference types → `T?` annotation only valid in nullable context but harmless.
        // Value types → `Nullable<T>`.
        var innerKind = inner.Kind;
        if (innerKind is TypeKind.String or TypeKind.Array or TypeKind.Record)
            return CSharpType(inner, reg) + "?";
        if (innerKind is TypeKind.Reference)
        {
            var def = reg.Lookup(inner.ReferenceName!);
            // Enums are value types; everything else [DeltaPack] builds is a class.
            var isValue = def?.Kind == TypeDefKind.Enum;
            return CSharpType(inner, reg) + "?"; // both forms render as T? in source
        }
        // int?, float?, bool? — all value types
        return CSharpType(inner, reg) + "?";
    }

    /// <summary>Whether the inner element of an Optional is a value type.</summary>
    public static bool IsOptionalOfValueType(TypeRef inner, ModelRegistry reg)
    {
        return inner.Kind switch
        {
            TypeKind.Int or TypeKind.Float or TypeKind.Boolean => true,
            TypeKind.Reference => reg.Lookup(inner.ReferenceName!)?.Kind == TypeDefKind.Enum,
            _ => false,
        };
    }

    /// <summary>A default initializer for a field (e.g. <c>"""</c>, <c>new()</c>, <c>null</c>).</summary>
    public static string DefaultInitializer(TypeRef t, ModelRegistry reg) => t.Kind switch
    {
        TypeKind.String => "\"\"",
        TypeKind.Boolean => "false",
        TypeKind.Float => "0f",
        TypeKind.Int => "0",
        TypeKind.Optional => "null",
        TypeKind.Array => $"new {CSharpType(t, reg)}()",
        TypeKind.Record => $"new {CSharpType(t, reg)}()",
        TypeKind.Reference => ReferenceDefault(t, reg),
        _ => throw new InvalidOperationException(),
    };

    private static string ReferenceDefault(TypeRef t, ModelRegistry reg)
    {
        var def = reg.Lookup(t.ReferenceName!);
        if (def?.Kind == TypeDefKind.Enum)
            return $"default({t.ReferenceName})";
        return $"{t.ReferenceName}.Default()";
    }

    // ========== Encoding (inline expression, using outer `encoder` variable) ==========

    public static string EncodeInline(TypeRef t, string val, ModelRegistry reg) => t.Kind switch
    {
        TypeKind.String => $"encoder.PushString({val})",
        TypeKind.Boolean => $"encoder.PushBoolean({val})",
        TypeKind.Float => EncodeFloat(t, val),
        TypeKind.Int => EncodeInt(t, val),
        // The inner lambdas take `encoder` as a parameter that shadows the outer `encoder`
        // variable — that keeps them non-capturing so the C# compiler caches them as static
        // delegates (one allocation per type, not per call).
        TypeKind.Array => $"encoder.PushArray({val}, (x, encoder) => {EncodeInline(t.ElementType!, "x", reg)})",
        TypeKind.Record => $"encoder.PushRecord({val}, (x, encoder) => {EncodeInline(t.KeyType!, "x", reg)}, (x, encoder) => {EncodeInline(t.ValueType!, "x", reg)})",
        TypeKind.Reference => EncodeReference(t, val, reg),
        // Optionals are handled at the statement level (PushBoolean + if for value types,
        // PushOptional for reference types). Callers use EncodeStatements for fields.
        _ => throw new InvalidOperationException(),
    };

    private static string EncodeFloat(TypeRef t, string val)
    {
        var fs = Strategy.FloatStrategyFor(t);
        return fs.Kind == FloatStrategyKind.Quantized
            ? $"encoder.PushFloatQuantized({val}, {FormatFloat(fs.Precision)})"
            : $"encoder.PushFloat({val})";
    }

    private static string EncodeInt(TypeRef t, string val)
    {
        var s = Strategy.IntStrategyFor(t);
        // Cast non-long to long for encoder calls.
        var asLong = t.IntStorage == IntStorage.Long ? val : $"(long){val}";
        return s.Kind switch
        {
            IntStrategyKind.Packed => $"encoder.PushBitPackedInt({asLong}, {s.Offset}, {s.Max}, {s.NumBits})",
            IntStrategyKind.Unsigned => $"encoder.PushBoundedInt({asLong}, {s.Offset})",
            IntStrategyKind.Signed => $"encoder.PushInt({asLong})",
            _ => throw new InvalidOperationException(),
        };
    }

    private static string EncodeReference(TypeRef t, string val, ModelRegistry reg)
    {
        var def = reg.Lookup(t.ReferenceName!);
        if (def?.Kind == TypeDefKind.Enum)
        {
            var numBits = EnumNumBits(def.EnumMembers.Length);
            return $"encoder.PushEnum((int){val}, {numBits})";
        }
        return $"{t.ReferenceName}.Encode_({val}, encoder)";
    }

    /// <summary>Writes the full encode statements for a top-level field, handling optionals.</summary>
    public static void EncodeField(CodeWriter w, FieldModel f, ModelRegistry reg, string objExpr)
    {
        var access = $"{objExpr}.{f.Name}";
        if (f.Type.Kind != TypeKind.Optional)
        {
            w.Line($"{EncodeInline(f.Type, access, reg)};");
            return;
        }
        var inner = f.Type.ElementType!;
        if (IsOptionalOfValueType(inner, reg))
        {
            // Nullable<T> pattern: PushBoolean(HasValue) + if (HasValue) encode(Value)
            w.Line($"encoder.PushBoolean({access}.HasValue);");
            w.Line($"if ({access}.HasValue) {EncodeInline(inner, $"{access}.Value", reg)};");
        }
        else
        {
            // Reference-type optional. Lambda takes `encoder` as a parameter that shadows the
            // outer `encoder` variable, so the compiler can cache the delegate statically.
            w.Line($"encoder.PushOptional({access}, (x, encoder) => {EncodeInline(inner, "x", reg)});");
        }
    }

    // ========== Decoding (inline expression, using outer `decoder` variable) ==========

    public static string DecodeInline(TypeRef t, ModelRegistry reg) => t.Kind switch
    {
        TypeKind.String => "decoder.NextString()",
        TypeKind.Boolean => "decoder.NextBoolean()",
        TypeKind.Float => DecodeFloat(t),
        TypeKind.Int => DecodeInt(t),
        TypeKind.Array => $"new DeltaPack.DPList<{CSharpType(t.ElementType!, reg)}>(decoder.Tracker, decoder.NextArray(() => {DecodeInline(t.ElementType!, reg)}))",
        TypeKind.Record => $"decoder.NextRecord(() => {DecodeInline(t.KeyType!, reg)}, () => {DecodeInline(t.ValueType!, reg)})",
        TypeKind.Reference => DecodeReference(t, reg),
        TypeKind.Optional => DecodeOptionalInline(t, reg),
        _ => throw new InvalidOperationException(),
    };

    private static string DecodeFloat(TypeRef t)
    {
        var fs = Strategy.FloatStrategyFor(t);
        return fs.Kind == FloatStrategyKind.Quantized
            ? $"decoder.NextFloatQuantized({FormatFloat(fs.Precision)})"
            : "decoder.NextFloat()";
    }

    private static string DecodeInt(TypeRef t)
    {
        var s = Strategy.IntStrategyFor(t);
        var storage = t.IntStorage;
        string innerLong = s.Kind switch
        {
            IntStrategyKind.Packed => $"((long)decoder.NextEnum({s.NumBits}) + {s.Offset})",
            IntStrategyKind.Unsigned => $"decoder.NextBoundedInt({s.Offset})",
            IntStrategyKind.Signed => "decoder.NextInt()",
            _ => throw new InvalidOperationException(),
        };
        // Cast back to declared storage type.
        return storage == IntStorage.Long ? innerLong : $"({storage.CSharpKeyword()}){innerLong}";
    }

    private static string DecodeReference(TypeRef t, ModelRegistry reg)
    {
        var def = reg.Lookup(t.ReferenceName!);
        if (def?.Kind == TypeDefKind.Enum)
        {
            var numBits = EnumNumBits(def.EnumMembers.Length);
            return $"({t.ReferenceName})decoder.NextEnum({numBits})";
        }
        return $"{t.ReferenceName}.Decode_(decoder)";
    }

    private static string DecodeOptionalInline(TypeRef t, ModelRegistry reg)
    {
        var inner = t.ElementType!;
        if (IsOptionalOfValueType(inner, reg))
        {
            // Mirror CLI: decoder.NextBoolean() ? (T?)inner : null
            var innerDecode = DecodeInline(inner, reg);
            var declared = CSharpType(inner, reg);
            return $"decoder.NextBoolean() ? ({declared}?){innerDecode} : null";
        }
        return $"decoder.NextOptional(() => {DecodeInline(inner, reg)})";
    }

    // ========== Equality ==========

    public static string EqualsInline(TypeRef t, string a, string b, ModelRegistry reg) => t.Kind switch
    {
        TypeKind.String or TypeKind.Boolean or TypeKind.Int => $"{a} == {b}",
        TypeKind.Float => EqualsFloat(t, a, b),
        TypeKind.Array => $"{a}.Count == {b}.Count && {a}.Zip({b}).All(pair => {EqualsInline(t.ElementType!, "pair.First", "pair.Second", reg)})",
        TypeKind.Record => $"{a}.Count == {b}.Count && {a}.All(kvp => {b}.TryGetValue(kvp.Key, out var v) && {EqualsInline(t.ValueType!, "kvp.Value", "v", reg)})",
        TypeKind.Reference => EqualsReference(t, a, b, reg),
        TypeKind.Optional => EqualsOptional(t, a, b, reg),
        _ => throw new InvalidOperationException(),
    };

    private static string EqualsFloat(TypeRef t, string a, string b)
    {
        var fs = Strategy.FloatStrategyFor(t);
        return fs.Kind == FloatStrategyKind.Quantized
            ? $"DeltaPack.EqualityHelpers.EqualsFloatQuantized({a}, {b}, {FormatFloat(fs.Precision)})"
            : $"DeltaPack.EqualityHelpers.EqualsFloat({a}, {b})";
    }

    private static string EqualsReference(TypeRef t, string a, string b, ModelRegistry reg)
    {
        var def = reg.Lookup(t.ReferenceName!);
        if (def?.Kind == TypeDefKind.Enum)
            return $"{a} == {b}";
        return $"{t.ReferenceName}.Equals({a}, {b})";
    }

    private static string EqualsOptional(TypeRef t, string a, string b, ModelRegistry reg)
    {
        var inner = t.ElementType!;
        var helper = IsOptionalOfValueType(inner, reg)
            ? "DeltaPack.EqualityHelpers.EqualsOptionalValue"
            : "DeltaPack.EqualityHelpers.EqualsOptional";
        var lambda = $"(x, y) => {EqualsInline(inner, "x", "y", reg)}";
        return $"{helper}({a}, {b}, {lambda})";
    }

    // ========== Clone ==========

    /// <summary>
    /// Emits an inline clone expression for a value of type <paramref name="t"/>.
    /// </summary>
    public static string CloneInline(TypeRef t, string val, ModelRegistry reg) => t.Kind switch
    {
        TypeKind.String or TypeKind.Boolean or TypeKind.Int or TypeKind.Float => val,
        TypeKind.Array => CloneArray(t, val, reg),
        TypeKind.Record => CloneRecord(t, val, reg),
        TypeKind.Reference => CloneReference(t, val, reg),
        TypeKind.Optional => CloneOptional(t, val, reg),
        _ => throw new InvalidOperationException(),
    };

    private static string CloneArray(TypeRef t, string val, ModelRegistry reg)
    {
        var elem = t.ElementType!;
        // Use the generator-only snapshot factory that sizes the inner list exactly,
        // skips per-element MarkDirty/NextVersion, and reparents children once.
        var containerType = $"DeltaPack.DPList<{CSharpType(elem, reg)}>";
        return IsDeepCloneNoop(elem, reg)
            ? $"{containerType}.CreateSnapshot({val})"
            : $"{containerType}.CreateSnapshot({val}, x => {CloneInline(elem, "x", reg)})";
    }

    private static string CloneRecord(TypeRef t, string val, ModelRegistry reg)
    {
        var valueType = t.ValueType!;
        // Snapshot factory bypasses the IDictionary ctor and skips per-entry dirty tracking.
        var containerType = $"DeltaPack.DPDict<{CSharpType(t.KeyType!, reg)}, {CSharpType(valueType, reg)}>";
        return IsDeepCloneNoop(valueType, reg)
            ? $"{containerType}.CreateSnapshot({val})"
            : $"{containerType}.CreateSnapshot({val}, x => {CloneInline(valueType, "x", reg)})";
    }

    private static string CloneReference(TypeRef t, string val, ModelRegistry reg)
    {
        var def = reg.Lookup(t.ReferenceName!);
        if (def?.Kind == TypeDefKind.Enum) return val;
        return $"{t.ReferenceName}.Clone({val})";
    }

    private static string CloneOptional(TypeRef t, string val, ModelRegistry reg)
    {
        var inner = t.ElementType!;
        if (IsDeepCloneNoop(inner, reg))
            return val;
        // reference type: null-check then clone
        return $"{val} != null ? {CloneInline(inner, val, reg)} : null";
    }

    /// <summary>True if a value of this type can be cloned by simple assignment (value types + strings + enums).</summary>
    private static bool IsDeepCloneNoop(TypeRef t, ModelRegistry reg)
    {
        switch (t.Kind)
        {
            case TypeKind.String:
            case TypeKind.Boolean:
            case TypeKind.Int:
            case TypeKind.Float:
                return true;
            case TypeKind.Reference:
                return reg.Lookup(t.ReferenceName!)?.Kind == TypeDefKind.Enum;
            default:
                return false;
        }
    }

    /// <summary>
    /// Name of the private backing field for a partial property. Must match the convention used
    /// in <see cref="TrackingEmitter"/>'s generated property bodies.
    /// </summary>
    public static string TrackingBackingField(FieldModel f)
        => "__dp_" + char.ToLowerInvariant(f.Name[0]) + f.Name.Substring(1);

    /// <summary>
    /// True if a value of this type can implement <see cref="DeltaPack.IDirtyTracked"/> and
    /// therefore participates in parent-wiring — both during snapshot construction (emitted
    /// by <see cref="ObjectEmitter"/>) and setter Detach/Reparent (emitted by
    /// <see cref="TrackingEmitter"/>). Arrays and records are always tracked. Reference
    /// types are tracked when the referenced class has at least one partial property.
    /// </summary>
    public static bool ChildIsTrackable(TypeRef t, ModelRegistry reg)
    {
        switch (t.Kind)
        {
            case TypeKind.Array:
            case TypeKind.Record:
                return true;
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

    // ========== EncodeDiff (per-field) ==========

    /// <summary>
    /// Emits the diff for a single field of the parent type. For tracked parents, the entire
    /// short-circuit + equals + encode sequence is inlined at the call site — the generated
    /// code reads the backing field directly (same-class access) and calls the encoder's byte
    /// writers without going through <c>Func</c> / <c>Action</c> delegates. This eliminates
    /// ~4 delegate invocations per field plus the redundant interface type check on every
    /// parent, which dominates EncodeDiff cost when most fields short-circuit.
    /// </summary>
    /// <remarks>
    /// <c>__dp_minVersion</c> is a parameter threaded through <c>EncodeDiff_</c> from the caller
    /// (<see cref="SyncSession{T}"/>'s scalar baseline, or <c>-1</c> by default for raw
    /// <c>EncodeDiff</c> users). See <see cref="ObjectEmitter.EmitEncodeDiff"/>.
    /// </remarks>
    public static void EncodeDiffField(CodeWriter w, FieldModel f, int slot, ModelRegistry reg, string aExpr, string bExpr, bool isTracked)
    {
        var t = f.Type;
        var a = $"{aExpr}.{f.Name}";
        var b = $"{bExpr}.{f.Name}";

        // Boolean diffs are a special case: no FieldDiff wrapper. Even on tracked classes
        // we still emit PushBooleanDiff — the bit cost (1) matches the false-bit cost we'd
        // emit for an unchanged tracked field, so there's no win from a tracked fast-path here.
        if (t.Kind == TypeKind.Boolean)
        {
            w.Line($"encoder.PushBooleanDiff({a}, {b});");
            return;
        }

        if (isTracked)
        {
            // Fully-inlined tracked field diff. EncodeDiff_ is emitted as a static method on
            // the parent's partial class, so it can read private `__dp_<field>` backing fields
            // and per-slot `__dp_dirty{slot}` versions directly. No interface casts, no delegate
            // invocations. The `else` branch scopes `__aF`/`__bF`/`__ch`, so field-local names
            // don't collide across the sequence of emitted blocks.
            var backing = TrackingBackingField(f);
            w.Line($"if ({bExpr}.__dp_dirty{slot} <= __dp_minVersion)");
            w.Line("{");
            w.Indent();
            w.Line("encoder.PushBoolean(false);");
            w.Dedent();
            w.Line("}");
            w.Line("else");
            w.Line("{");
            w.Indent();
            w.Line($"var __aF = {aExpr}.{backing};");
            w.Line($"var __bF = {bExpr}.{backing};");
            w.Line($"var __ch = !({EqualsInline(t, "__aF", "__bF", reg)});");
            w.Line("encoder.PushBoolean(__ch);");
            w.Line($"if (__ch) {EncodeDiffInline(t, "__aF", "__bF", reg)};");
            w.Dedent();
            w.Line("}");
            return;
        }

        var declaredType = CSharpType(t, reg);
        var equalsLambda = $"(x, y) => {EqualsInline(t, "x", "y", reg)}";
        // `(x, y, encoder)` — the lambda parameter named `encoder` shadows the outer
        // `encoder` variable used inside EncodeDiffInline, so the lambda is non-capturing
        // and the compiler caches the delegate in a static field.
        var diffLambda = $"(x, y, encoder) => {EncodeDiffInline(t, "x", "y", reg)}";
        w.Line($"encoder.PushFieldDiff<{declaredType}>({a}, {b}, {equalsLambda}, {diffLambda});");
    }

    /// <summary>Expression that encodes the diff of two values of this type into `encoder`.</summary>
    public static string EncodeDiffInline(TypeRef t, string a, string b, ModelRegistry reg) => t.Kind switch
    {
        TypeKind.String => $"encoder.PushStringDiff({a}, {b})",
        // Inside a container (array/record/optional), bool flip is inferred by the decoder —
        // emit an empty statement-lambda body. Top-level bool fields use PushBooleanDiff via
        // EncodeDiffField's special case.
        TypeKind.Boolean => "{ }",
        TypeKind.Float => EncodeFloatDiff(t, a, b),
        TypeKind.Int => EncodeIntDiff(t, a, b),
        TypeKind.Array => EncodeArrayDiff(t, a, b, reg),
        TypeKind.Record => EncodeRecordDiff(t, a, b, reg),
        TypeKind.Reference => EncodeReferenceDiff(t, a, b, reg),
        TypeKind.Optional => EncodeOptionalDiff(t, a, b, reg),
        _ => throw new InvalidOperationException(),
    };

    private static string EncodeFloatDiff(TypeRef t, string a, string b)
    {
        var fs = Strategy.FloatStrategyFor(t);
        return fs.Kind == FloatStrategyKind.Quantized
            ? $"encoder.PushFloatQuantizedDiff({a}, {b}, {FormatFloat(fs.Precision)})"
            : $"encoder.PushFloatDiff({a}, {b})";
    }

    private static string EncodeIntDiff(TypeRef t, string a, string b)
    {
        var s = Strategy.IntStrategyFor(t);
        var aLong = t.IntStorage == IntStorage.Long ? a : $"(long){a}";
        var bLong = t.IntStorage == IntStorage.Long ? b : $"(long){b}";
        return s.Kind switch
        {
            IntStrategyKind.Packed => $"encoder.PushBitPackedIntDiff({aLong}, {bLong}, {s.Offset}, {s.Max}, {s.NumBits})",
            IntStrategyKind.Unsigned => $"encoder.PushBoundedIntDiff({aLong}, {bLong}, {s.Offset})",
            IntStrategyKind.Signed => $"encoder.PushIntDiff({aLong}, {bLong})",
            _ => throw new InvalidOperationException(),
        };
    }

    private static string EncodeArrayDiff(TypeRef t, string a, string b, ModelRegistry reg)
    {
        var elem = t.ElementType!;
        var elemType = CSharpType(elem, reg);
        var eqLambda = $"(x, y) => {EqualsInline(elem, "x", "y", reg)}";
        // Lambda param `encoder` shadows the outer encoder → non-capturing → statically cached.
        var encodeLambda = $"(x, encoder) => {EncodeInline(elem, "x", reg)}";
        var diffLambda = $"(x, y, encoder) => {EncodeDiffInline(elem, "x", "y", reg)}";
        return $"encoder.PushArrayDiff<{elemType}>({a}, {b}, {eqLambda}, {encodeLambda}, {diffLambda})";
    }

    private static string EncodeRecordDiff(TypeRef t, string a, string b, ModelRegistry reg)
    {
        var kType = CSharpType(t.KeyType!, reg);
        var vType = CSharpType(t.ValueType!, reg);
        var valEq = $"(x, y) => {EqualsInline(t.ValueType!, "x", "y", reg)}";
        var keyEnc = $"(x, encoder) => {EncodeInline(t.KeyType!, "x", reg)}";
        var valEnc = $"(x, encoder) => {EncodeInline(t.ValueType!, "x", reg)}";
        var valDiff = $"(x, y, encoder) => {EncodeDiffInline(t.ValueType!, "x", "y", reg)}";
        return $"encoder.PushRecordDiff<{kType}, {vType}>({a}, {b}, {valEq}, {keyEnc}, {valEnc}, {valDiff})";
    }

    private static string EncodeReferenceDiff(TypeRef t, string a, string b, ModelRegistry reg)
    {
        var def = reg.Lookup(t.ReferenceName!);
        if (def?.Kind == TypeDefKind.Enum)
        {
            var numBits = EnumNumBits(def.EnumMembers.Length);
            return $"encoder.PushEnumDiff((int){a}, (int){b}, {numBits})";
        }
        return $"{t.ReferenceName}.EncodeDiff_({a}, {b}, encoder)";
    }

    private static string EncodeOptionalDiff(TypeRef t, string a, string b, ModelRegistry reg)
    {
        var inner = t.ElementType!;
        var innerType = CSharpType(inner, reg);
        // Lambda param `encoder` shadows outer → non-capturing → statically cached.
        var enc = $"(x, encoder) => {EncodeInline(inner, "x", reg)}";
        var diff = $"(x, y, encoder) => {EncodeDiffInline(inner, "x", "y", reg)}";
        return $"encoder.PushOptionalDiff<{innerType}>({a}, {b}, {enc}, {diff})";
    }

    // ========== DecodeDiff ==========

    public static string DecodeDiffField(FieldModel f, ModelRegistry reg, string objExpr)
    {
        var t = f.Type;
        var old = $"{objExpr}.{f.Name}";
        if (t.Kind == TypeKind.Boolean)
            return $"decoder.NextBooleanDiff({old})";
        return $"decoder.NextFieldDiff({old}, x => {DecodeDiffInline(t, "x", reg)})";
    }

    public static string DecodeDiffInline(TypeRef t, string old, ModelRegistry reg) => t.Kind switch
    {
        TypeKind.String => $"decoder.NextStringDiff({old})",
        // Inside a container, the flip is implicit: the "changed" bit was already read, so
        // the new value is just `!old`. Top-level bool fields use NextBooleanDiff via DecodeDiffField.
        TypeKind.Boolean => $"!{old}",
        TypeKind.Float => DecodeFloatDiff(t, old),
        TypeKind.Int => DecodeIntDiff(t, old),
        TypeKind.Array => DecodeArrayDiff(t, old, reg),
        TypeKind.Record => DecodeRecordDiff(t, old, reg),
        TypeKind.Reference => DecodeReferenceDiff(t, old, reg),
        TypeKind.Optional => DecodeOptionalDiff(t, old, reg),
        _ => throw new InvalidOperationException(),
    };

    private static string DecodeFloatDiff(TypeRef t, string old)
    {
        var fs = Strategy.FloatStrategyFor(t);
        return fs.Kind == FloatStrategyKind.Quantized
            ? $"decoder.NextFloatQuantizedDiff({old}, {FormatFloat(fs.Precision)})"
            : $"decoder.NextFloatDiff({old})";
    }

    private static string DecodeIntDiff(TypeRef t, string old)
    {
        var s = Strategy.IntStrategyFor(t);
        var oldLong = t.IntStorage == IntStorage.Long ? old : $"(long){old}";
        string innerLong = s.Kind switch
        {
            IntStrategyKind.Packed => $"((long)decoder.NextEnumDiff((int)({old} - {s.Offset}), {s.NumBits}) + {s.Offset})",
            IntStrategyKind.Unsigned => $"decoder.NextBoundedIntDiff({oldLong}, {s.Offset})",
            IntStrategyKind.Signed => $"decoder.NextIntDiff({oldLong})",
            _ => throw new InvalidOperationException(),
        };
        return t.IntStorage == IntStorage.Long ? innerLong : $"({t.IntStorage.CSharpKeyword()}){innerLong}";
    }

    private static string DecodeArrayDiff(TypeRef t, string old, ModelRegistry reg)
    {
        var elem = t.ElementType!;
        var elemType = CSharpType(elem, reg);
        return $"decoder.NextArrayDiff<{elemType}>({old}, () => {DecodeInline(elem, reg)}, x => {DecodeDiffInline(elem, "x", reg)})";
    }

    private static string DecodeRecordDiff(TypeRef t, string old, ModelRegistry reg)
    {
        var kType = CSharpType(t.KeyType!, reg);
        var vType = CSharpType(t.ValueType!, reg);
        return $"decoder.NextRecordDiff<{kType}, {vType}>({old}, () => {DecodeInline(t.KeyType!, reg)}, () => {DecodeInline(t.ValueType!, reg)}, x => {DecodeDiffInline(t.ValueType!, "x", reg)})";
    }

    private static string DecodeReferenceDiff(TypeRef t, string old, ModelRegistry reg)
    {
        var def = reg.Lookup(t.ReferenceName!);
        if (def?.Kind == TypeDefKind.Enum)
        {
            var numBits = EnumNumBits(def.EnumMembers.Length);
            return $"({t.ReferenceName})decoder.NextEnumDiff((int){old}, {numBits})";
        }
        return $"{t.ReferenceName}.DecodeDiff_({old}, decoder)";
    }

    private static string DecodeOptionalDiff(TypeRef t, string old, ModelRegistry reg)
    {
        var inner = t.ElementType!;
        var innerType = CSharpType(inner, reg);
        return $"decoder.NextOptionalDiff<{innerType}>({old}, () => {DecodeInline(inner, reg)}, x => {DecodeDiffInline(inner, "x", reg)})";
    }

    // ========== FromJson ==========

    /// <summary>Expression that parses a value of type <paramref name="t"/> from JsonElement <paramref name="jsonExpr"/>.</summary>
    public static string FromJsonInline(TypeRef t, string jsonExpr, ModelRegistry reg) => t.Kind switch
    {
        TypeKind.String => $"DeltaPack.JsonHelpers.ParseString({jsonExpr})",
        TypeKind.Boolean => $"DeltaPack.JsonHelpers.ParseBoolean({jsonExpr})",
        TypeKind.Float => FromJsonFloat(t, jsonExpr),
        TypeKind.Int => $"{jsonExpr}.{IntGetter(t.IntStorage)}()",
        TypeKind.Array => $"new DeltaPack.DPList<{CSharpType(t.ElementType!, reg)}>({jsonExpr}.EnumerateArray().Select(x => {FromJsonInline(t.ElementType!, "x", reg)}))",
        TypeKind.Record => FromJsonRecord(t, jsonExpr, reg),
        TypeKind.Reference => FromJsonReference(t, jsonExpr, reg),
        TypeKind.Optional => throw new InvalidOperationException("Optional must be handled at the field level; see FromJsonField."),
        _ => throw new InvalidOperationException(),
    };

    private static string FromJsonFloat(TypeRef t, string jsonExpr)
    {
        var fs = Strategy.FloatStrategyFor(t);
        return fs.Kind == FloatStrategyKind.Quantized
            ? $"DeltaPack.JsonHelpers.ParseFloatQuantized({jsonExpr}, {FormatFloat(fs.Precision)})"
            : $"{jsonExpr}.GetSingle()";
    }

    private static string FromJsonRecord(TypeRef t, string jsonExpr, ModelRegistry reg)
    {
        var keyParse = RecordKeyFromJson(t.KeyType!);
        var valueParse = FromJsonInline(t.ValueType!, "p.Value", reg);
        return $"{jsonExpr}.EnumerateObject().ToDPDict(p => {keyParse}, p => {valueParse})";
    }

    private static string RecordKeyFromJson(TypeRef keyType) => keyType.Kind switch
    {
        TypeKind.String => "p.Name",
        TypeKind.Int => keyType.IntStorage switch
        {
            IntStorage.Int => "int.Parse(p.Name)",
            IntStorage.Long => "long.Parse(p.Name)",
            IntStorage.UInt => "uint.Parse(p.Name)",
            IntStorage.ULong => "ulong.Parse(p.Name)",
            _ => $"{keyType.IntStorage.CSharpKeyword()}.Parse(p.Name)",
        },
        _ => throw new InvalidOperationException($"Unsupported record key type: {keyType.Kind}"),
    };

    private static string FromJsonReference(TypeRef t, string jsonExpr, ModelRegistry reg)
    {
        var def = reg.Lookup(t.ReferenceName!);
        if (def?.Kind == TypeDefKind.Enum)
            return $"DeltaPack.JsonHelpers.ParseEnum<{t.ReferenceName}>({jsonExpr})";
        return $"{t.ReferenceName}.FromJson({jsonExpr})";
    }

    /// <summary>
    /// Renders the RHS expression for a field assignment inside <c>FromJson</c>. Handles the
    /// <c>TryGetProperty</c>/<c>IsNullOrEmpty</c> pattern for optional fields; non-optional
    /// fields use <c>json.GetProperty("f")</c> directly.
    /// </summary>
    public static string FromJsonField(FieldModel f, ModelRegistry reg)
    {
        if (f.Type.Kind == TypeKind.Optional)
        {
            var inner = f.Type.ElementType!;
            var elVar = f.JsonName + "El";
            var innerExpr = FromJsonInline(inner, elVar, reg);
            // Target-typed conditional: the `null` branch + the inner-typed branch both
            // unify to the field's declared nullable type without an explicit cast.
            return $"json.TryGetProperty(\"{f.JsonName}\", out var {elVar}) ? DeltaPack.JsonHelpers.IsNullOrEmpty({elVar}) ? null : {innerExpr} : null";
        }
        return FromJsonInline(f.Type, $"json.GetProperty(\"{f.JsonName}\")", reg);
    }

    private static string IntGetter(IntStorage s) => s switch
    {
        IntStorage.SByte => "GetSByte",
        IntStorage.Short => "GetInt16",
        IntStorage.Int => "GetInt32",
        IntStorage.Long => "GetInt64",
        IntStorage.Byte => "GetByte",
        IntStorage.UShort => "GetUInt16",
        IntStorage.UInt => "GetUInt32",
        IntStorage.ULong => "GetUInt64",
        _ => throw new InvalidOperationException(),
    };

    // ========== ToJson ==========

    /// <summary>Expression that produces a JsonNode (or JsonNode-assignable value) for a value.</summary>
    public static string ToJsonInline(TypeRef t, string val, ModelRegistry reg) => t.Kind switch
    {
        TypeKind.String or TypeKind.Boolean or TypeKind.Float or TypeKind.Int => val,
        TypeKind.Array => ToJsonArray(t, val, reg),
        TypeKind.Record => ToJsonRecord(t, val, reg),
        TypeKind.Reference => ToJsonReference(t, val, reg),
        TypeKind.Optional => throw new InvalidOperationException("Optional must be handled at the field level; see ToJsonField."),
        _ => throw new InvalidOperationException(),
    };

    private static string ToJsonArray(TypeRef t, string val, ModelRegistry reg)
    {
        var elem = t.ElementType!;
        var inner = ToJsonNodeCast(elem, "x", reg);
        return $"new System.Text.Json.Nodes.JsonArray({val}.Select(x => {inner}).ToArray())";
    }

    private static string ToJsonRecord(TypeRef t, string val, ModelRegistry reg)
    {
        var keyExpr = RecordKeyToJson(t.KeyType!, "kvp.Key");
        var valueExpr = ToJsonNodeCast(t.ValueType!, "kvp.Value", reg);
        return $"new System.Text.Json.Nodes.JsonObject({val}.Select(kvp => new System.Collections.Generic.KeyValuePair<string, System.Text.Json.Nodes.JsonNode?>({keyExpr}, {valueExpr})))";
    }

    private static string RecordKeyToJson(TypeRef keyType, string expr) => keyType.Kind switch
    {
        TypeKind.String => expr,
        TypeKind.Int => $"{expr}.ToString()",
        _ => throw new InvalidOperationException(),
    };

    private static string ToJsonReference(TypeRef t, string val, ModelRegistry reg)
    {
        var def = reg.Lookup(t.ReferenceName!);
        if (def?.Kind == TypeDefKind.Enum)
            return $"{val}.ToString()";
        return $"{t.ReferenceName}.ToJson({val})";
    }

    /// <summary>
    /// Produces a `(JsonNode?)<value-as-json>` cast used inside JsonArray constructors where
    /// the implicit conversion from primitives needs a nudge.
    /// </summary>
    private static string ToJsonNodeCast(TypeRef t, string val, ModelRegistry reg)
    {
        var inner = ToJsonInline(t, val, reg);
        // Enum ToJson is a string; primitive (string/int/long/float/bool) has implicit JsonNode
        // conversion but needs `(JsonNode?)` when used as an array element expression.
        // Nested objects return JsonObject which is JsonNode.
        return $"(System.Text.Json.Nodes.JsonNode?){inner}";
    }

    /// <summary>
    /// Writes the full ToJson statement(s) for a top-level field, handling optionals.
    /// </summary>
    public static void ToJsonField(CodeWriter w, FieldModel f, ModelRegistry reg, string objExpr, string resultExpr)
    {
        var access = $"{objExpr}.{f.Name}";
        if (f.Type.Kind != TypeKind.Optional)
        {
            w.Line($"{resultExpr}[\"{f.JsonName}\"] = {ToJsonInline(f.Type, access, reg)};");
            return;
        }
        var inner = f.Type.ElementType!;
        if (IsOptionalOfValueType(inner, reg))
        {
            // Nullable<T>: pass the Nullable directly for primitives (JsonNode has implicit
            // converters from `T?`). For optional enums, match CLI by calling ToString() on
            // the Nullable; when HasValue, it delegates to the enum value's ToString().
            var innerVal = inner.Kind == TypeKind.Reference
                ? $"{access}.ToString()"
                : access;
            w.Line($"if ({access}.HasValue) {resultExpr}[\"{f.JsonName}\"] = {innerVal};");
        }
        else
        {
            w.Line($"if ({access} != null) {resultExpr}[\"{f.JsonName}\"] = {ToJsonInline(inner, access, reg)};");
        }
    }

    // ========== Utilities ==========

    public static int EnumNumBits(int numMembers)
        => numMembers <= 1 ? 1 : (int)Math.Ceiling(Math.Log(numMembers) / Math.Log(2));

    private static string FormatFloat(float f) => f.ToString("R", System.Globalization.CultureInfo.InvariantCulture) + "f";
}
