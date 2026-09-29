import React from 'react';
import { Sparkles, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const st = (status || 'Open').toLowerCase();

  const styles = {
    investigating: 'bg-purple-950/50 text-purple-300 border-purple-800/60 shadow-glow-ai',
    open: 'bg-amber-950/40 text-amber-300 border-amber-800/50',
    resolved: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50',
    closed: 'bg-gray-800/60 text-gray-400 border-gray-700',
  };

  const icons = {
    investigating: <Sparkles className="w-3 h-3 text-purple-400 animate-subtle-pulse" />,
    open: <Clock className="w-3 h-3 text-amber-400" />,
    resolved: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
    closed: <AlertCircle className="w-3 h-3 text-gray-400" />,
  };

  const badgeStyle = styles[st] || styles.open;
  const icon = icons[st] || icons.open;

  const sizeClasses = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5'
    : size === 'md'
    ? 'text-xs px-2.5 py-1'
    : 'text-[11px] px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-md font-mono ${badgeStyle} ${sizeClasses}`}
    >
      {icon}
      <span>{status}</span>
    </span>
  );
}
