// Polyfill for records in .NET Standard 2.1
// This type is required for init-only properties used by records
#if NETSTANDARD2_1
namespace System.Runtime.CompilerServices
{
    internal static class IsExternalInit { }
}
#endif
