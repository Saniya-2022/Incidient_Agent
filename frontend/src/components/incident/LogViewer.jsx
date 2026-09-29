import React, { useState } from 'react';
import { Terminal, Copy, Check, Filter, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LogViewer({ logs = [], incidentId }) {
  const { addToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [filterText, setFilterText] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    addToast({
      title: 'Logs Copied',
      message: `${logs.length} log lines copied to clipboard.`,
      type: 'info',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${incidentId || 'incident'}_telemetry_logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter((line) =>
    line.toLowerCase().includes(filterText.toLowerCase())
  );

  const formatLogLine = (line) => {
    let levelClass = 'text-gray-400';
    if (line.includes('ERROR')) {
      levelClass = 'text-red-400 font-semibold';
    } else if (line.includes('WARN')) {
      levelClass = 'text-amber-400';
    } else if (line.includes('INFO')) {
      levelClass = 'text-blue-400';
    }

    return (
      <span className={levelClass}>
        {line}
      </span>
    );
  };

  return (
    <div className="bg-[#0A0E1A] rounded-lg border border-border overflow-hidden font-mono text-xs shadow-lg">
      {/* Terminal Titlebar */}
      <div className="px-4 py-2.5 bg-[#0e1422] border-b border-border flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <Terminal className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-300 font-medium">Incident Telemetry Logs</span>
          <span className="text-[10px] text-gray-400 bg-[#151D2E] px-1.5 py-0.5 rounded border border-border">
            stdout/stderr
          </span>
        </div>

        {/* Actions & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter logs..."
              className="bg-[#151D2E] border border-border rounded pl-6 pr-2 py-1 text-[11px] text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#151D2E] border border-border hover:bg-[#1f293d] text-gray-300 transition-colors text-[11px]"
            title="Copy logs"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-1 rounded bg-[#151D2E] border border-border hover:bg-[#1f293d] text-gray-300 transition-colors"
            title="Download log dump"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Content Body */}
      <div className="p-4 max-h-72 overflow-y-auto space-y-1 leading-relaxed selection:bg-purple-900 selection:text-white">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-400 italic py-4 text-center">
            No log lines match '{filterText}'
          </div>
        ) : (
          filteredLogs.map((line, idx) => (
            <div key={idx} className="flex items-start gap-3 hover:bg-[#151D2E]/60 py-0.5 px-1 rounded">
              <span className="text-gray-400 select-none text-[10px] w-6 shrink-0 text-right">
                {idx + 1}
              </span>
              <div className="flex-1 break-all">
                {formatLogLine(line)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Terminal Footer */}
      <div className="px-4 py-1.5 bg-[#090D18] border-t border-border/80 flex items-center justify-between text-[10px] text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live stream connected • Log buffer: 64KB
        </span>
        <span>{logs.length} lines captured</span>
      </div>
    </div>
  );
}
