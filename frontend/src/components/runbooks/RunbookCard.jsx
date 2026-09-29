import React from 'react';
import { BookOpen, CheckCircle, Clock, ChevronRight, Zap } from 'lucide-react';

export default function RunbookCard({ runbook, onView }) {
  const getCategoryBadge = (category) => {
    const c = (category || '').toLowerCase();
    if (c === 'database') return 'bg-cyan-950/50 text-cyan-300 border-cyan-800/50';
    if (c === 'authentication') return 'bg-purple-950/50 text-purple-300 border-purple-800/50';
    if (c === 'payment') return 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50';
    if (c === 'infrastructure') return 'bg-blue-950/50 text-blue-300 border-blue-800/50';
    if (c === 'streaming') return 'bg-orange-950/50 text-orange-300 border-orange-800/50';
    return 'bg-gray-800 text-gray-300 border-gray-700';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-5 hover:border-border-light hover:shadow-lg transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-bold text-purple-400">
            {runbook.id}
          </span>
          <span
            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getCategoryBadge(
              runbook.category
            )}`}
          >
            {runbook.category}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-gray-100 group-hover:text-purple-300 transition-colors leading-snug">
          {runbook.title}
        </h3>

        {runbook.description && (
          <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
            {runbook.description}
          </p>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-border/80">
        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-400 mb-4">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Used: <strong className="text-gray-200">{runbook.usedCount} times</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Success: <strong className="text-emerald-400">{runbook.successRate}%</strong></span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onView(runbook)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg bg-[#151D2E] hover:bg-purple-950/50 hover:text-purple-200 hover:border-purple-800/60 border border-border text-gray-300 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>View Runbook SOP</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400" />
        </button>
      </div>
    </div>
  );
}
