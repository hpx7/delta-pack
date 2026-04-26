using Microsoft.CodeAnalysis;

namespace DeltaPack.SourceGenerator;

internal static class Diagnostics
{
    private const string Category = "DeltaPack";

    public static readonly DiagnosticDescriptor MissingPartial = new(
        id: "DP001",
        title: "[DeltaPack] types must be declared partial",
        messageFormat: "Type '{0}' is marked with [DeltaPack] but is not declared as 'partial'",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor GenericTypeUnsupported = new(
        id: "DP002",
        title: "Generic [DeltaPack] types are not supported",
        messageFormat: "Type '{0}' is generic; [DeltaPack] is only supported on closed types",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor UseDPDict = new(
        id: "DP003",
        title: "Use DeltaPack.DPDict for map fields",
        messageFormat: "Field '{0}' uses '{1}'; delta-pack requires DeltaPack.DPDict<TKey, TValue> for map fields (insertion-order required for deterministic diffs)",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor StructNotSupported = new(
        id: "DP004",
        title: "[DeltaPack] structs are not supported",
        messageFormat: "Type '{0}' is a struct; [DeltaPack] is only supported on reference types",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor DoubleNotSupported = new(
        id: "DP005",
        title: "'double' fields are not supported",
        messageFormat: "Field '{0}' is of type 'double'; delta-pack wire format only supports 32-bit floats — use 'float' instead",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor MemberConflict = new(
        id: "DP006",
        title: "[DeltaPack] type declares a member that conflicts with generator output",
        messageFormat: "Type '{0}' declares member '{1}' which is also emitted by the [DeltaPack] source generator",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor AbstractMissingUnion = new(
        id: "DP007",
        title: "Abstract [DeltaPack] types must specify variants via [DeltaPackUnion]",
        messageFormat: "Abstract type '{0}' is marked [DeltaPack] but is missing [DeltaPackUnion(typeof(Variant1), ...)]",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor UnsupportedFieldType = new(
        id: "DP008",
        title: "Unsupported field type",
        messageFormat: "Field '{0}' has unsupported type '{1}' for delta-pack serialization",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor UnionVariantNotRegistered = new(
        id: "DP009",
        title: "Union variants must also be marked [DeltaPack]",
        messageFormat: "Variant '{0}' of union '{1}' must also be marked with [DeltaPack]",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor UseDPList = new(
        id: "DP012",
        title: "Use DeltaPack.DPList for array fields",
        messageFormat: "Field '{0}' uses '{1}'; delta-pack requires DeltaPack.DPList<T> for array fields",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor PartialPropertyMissingSetter = new(
        id: "DP013",
        title: "Partial property on [DeltaPack] type must declare a setter",
        messageFormat:
            "Property '{0}.{1}' is declared 'partial' without a setter; delta-pack tracks " +
            "mutations via setter interception. Add 'set;' to enable tracking, or remove " +
            "'partial' to drop the property from serialization",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor PartialPropertyInitOnly = new(
        id: "DP014",
        title: "Partial properties on [DeltaPack] types cannot use 'init' setters",
        messageFormat:
            "Property '{0}.{1}' uses 'init'; delta-pack tracking requires a regular settable " +
            "property. Replace 'init;' with 'set;', or remove 'partial' to use comparison-based " +
            "diff for this immutable field",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor IgnoreOnPartialProperty = new(
        id: "DP015",
        title: "[DeltaPackIgnore] cannot be combined with a partial property",
        messageFormat:
            "Property '{0}.{1}' has both [DeltaPackIgnore] and 'partial'; these are " +
            "contradictory — 'partial' opts in to generated tracking that [DeltaPackIgnore] " +
            "removes. Drop one of them",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);
}
