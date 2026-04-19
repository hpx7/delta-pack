using System;
using System.Text;

namespace DeltaPack.SourceGenerator.Emit;

internal sealed class CodeWriter
{
    private readonly StringBuilder _sb = new();
    private int _indent;
    private bool _atLineStart = true;

    public void Indent() => _indent++;
    public void Dedent() => _indent = Math.Max(0, _indent - 1);

    public IDisposable Block(string header)
    {
        Line(header);
        Line("{");
        Indent();
        return new BlockScope(this);
    }

    public IDisposable Block() => Block("");

    public void Line(string s = "")
    {
        if (s.Length == 0)
        {
            _sb.Append('\n');
            _atLineStart = true;
            return;
        }
        WriteIndent();
        _sb.Append(s);
        _sb.Append('\n');
        _atLineStart = true;
    }

    public void Write(string s)
    {
        if (_atLineStart) WriteIndent();
        _sb.Append(s);
        _atLineStart = false;
    }

    private void WriteIndent()
    {
        for (int i = 0; i < _indent; i++) _sb.Append("    ");
        _atLineStart = false;
    }

    public override string ToString() => _sb.ToString();

    private sealed class BlockScope : IDisposable
    {
        private readonly CodeWriter _w;
        public BlockScope(CodeWriter w) => _w = w;
        public void Dispose()
        {
            _w.Dedent();
            _w.Line("}");
        }
    }
}
