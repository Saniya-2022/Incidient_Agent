import React from 'react';

export default function SeverityBadge({ severity, size = 'sm' }) {
  const sev = (severity || 'Low').toLowerCase();

  const styles = {
    critical: 'bg-red-950/50 text-red-400 border-red-800/60 ring-red-500/20',
    high: 'bg-orange-950/50 text-orange-400 border-orange-800/60 ring-orange-500/20',
    medium: 'bg-amber-950/50 text-amber-400 border-amber-800/60 ring-amber-500/20',
    low: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60 ring-emerald-500/20',
  };

  const dots = {
    critical: 'bg-red-500 animate-pulse',
    high: 'bg-orange-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  };

  const badgeStyle = styles[sev] || styles.low;
  const dotStyle = dots[sev] || dots.low;

  const sizeClasses = size === 'xs' 
    ? 'text-[10px] px-1.5 py-0.5' 
    : size === 'md' 
    ? 'text-xs px-2.5 py-1' 
    : 'text-[11px] px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-md uppercase tracking-wider font-mono ${badgeStyle} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
      {severity}
    </span>
  );
}
