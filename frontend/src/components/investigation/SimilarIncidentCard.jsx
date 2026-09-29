import React from 'react';
import { ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SimilarIncidentCard({ item, onClick }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={onClick || (() => navigate(`/memory?search=${item.id}`))}
      className="p-4 rounded-lg bg-[#151D2E] border border-border hover:border-purple-500/60 transition-all cursor-pointer group hover:shadow-glow-ai"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-purple-400 group-hover:text-purple-300">
            {item.id}
          </span>
          {item.service && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111827] border border-border text-gray-300">
              {item.service}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">
            {item.similarity}% match
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-200 transition-colors" />
        </div>
      </div>

      {item.title && (
        <p className="text-xs font-medium text-gray-200 mb-1">{item.title}</p>
      )}

      <div className="space-y-1.5 text-xs mt-2 pt-2 border-t border-border/80">
        <div>
          <span className="text-[11px] font-mono text-gray-400 block">Root Cause:</span>
          <span className="text-gray-300">{item.rootCause}</span>
        </div>
        {item.resolution && (
          <div>
            <span className="text-[11px] font-mono text-gray-400 block">Past Resolution:</span>
            <span className="text-emerald-300/90">{item.resolution}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 text-[10px] text-gray-400 font-mono border-t border-border/50">
        <span>Resolved: {item.date || 'Historical'}</span>
        {item.verifiedBy && <span>Lead: {item.verifiedBy}</span>}
      </div>
    </div>
  );
}
