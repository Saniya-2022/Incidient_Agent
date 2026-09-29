import React from 'react';

export default function AIConfidence({ score = 94, size = 'md' }) {
  let color = 'text-purple-400';
  let barColor = 'bg-purple-500';
  let rating = 'High Confidence';

  if (score >= 90) {
    color = 'text-emerald-400';
    barColor = 'bg-emerald-500';
    rating = 'Very High';
  } else if (score >= 80) {
    color = 'text-purple-400';
    barColor = 'bg-purple-500';
    rating = 'High';
  } else if (score >= 65) {
    color = 'text-amber-400';
    barColor = 'bg-amber-500';
    rating = 'Moderate';
  } else {
    color = 'text-red-400';
    barColor = 'bg-red-500';
    rating = 'Low';
  }

  return (
    <div className="flex flex-col gap-1.5 font-mono">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 font-sans text-[11px] uppercase tracking-wider">
          AI Confidence Rating
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`font-bold ${color}`}>{score}%</span>
          <span className="text-[10px] text-gray-400">({rating})</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-[#151D2E] rounded-full overflow-hidden border border-border">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
