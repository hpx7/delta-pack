namespace DeltaPack;

internal sealed class StringInterner
{
    private const int LinearScanThreshold = 24;

    private readonly List<string> _dict = new();
    private readonly Dictionary<string, int> _index = new();
    private bool _indexReady;

    public void Reset()
    {
        _dict.Clear();
        _indexReady = false;
    }

    // Returns existing index (>=0) if already interned, or -1 after adding.
    public int Intern(string val)
    {
        if (!_indexReady && _dict.Count >= LinearScanThreshold)
            BuildIndex();
        var idx = _indexReady ? _index.GetValueOrDefault(val, -1) : _dict.IndexOf(val);
        if (idx >= 0)
            return idx;
        if (_indexReady)
            _index[val] = _dict.Count;
        _dict.Add(val);
        return -1;
    }

    private void BuildIndex()
    {
        _index.Clear();
        for (var i = 0; i < _dict.Count; i++)
            _index[_dict[i]] = i;
        _indexReady = true;
    }
}
