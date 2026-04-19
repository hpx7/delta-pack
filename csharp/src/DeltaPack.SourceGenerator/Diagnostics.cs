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

    public static readonly DiagnosticDescriptor DictionaryNotSupported = new(
        id: "DP003",
        title: "Use DeltaPack.OrderedDict for map fields",
        messageFormat: "Field '{0}' uses '{1}'; delta-pack requires DeltaPack.OrderedDict<TKey, TValue> for map fields (insertion-order required for deterministic diffs)",
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

    public static readonly DiagnosticDescriptor TrackedRequiresDeltaPack = new(
        id: "DP010",
        title: "[DeltaPackTracked] requires [DeltaPack]",
        messageFormat: "Type '{0}' is marked [DeltaPackTracked] but is missing [DeltaPack]; tracking only applies to delta-pack generated types",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor TrackedPropertyMustBePartial = new(
        id: "DP011",
        title: "[DeltaPackTracked] serialized properties must be declared 'partial'",
        messageFormat: "Property '{0}.{1}' must be declared 'partial' in a [DeltaPackTracked] class so the source generator can emit a dirty-tracking setter (requires C# 13)",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor TrackedListRequired = new(
        id: "DP012",
        title: "[DeltaPackTracked] list properties must use TrackedList<T>",
        messageFormat: "Property '{0}.{1}' is declared as List<T>; change to DeltaPack.TrackedList<T> so collection mutations are tracked",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);

    public static readonly DiagnosticDescriptor TrackedOrderedDictRequired = new(
        id: "DP013",
        title: "[DeltaPackTracked] map properties must use TrackedOrderedDict<K, V>",
        messageFormat: "Property '{0}.{1}' is declared as OrderedDict<K, V>; change to DeltaPack.TrackedOrderedDict<K, V> so collection mutations are tracked",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true);
}
