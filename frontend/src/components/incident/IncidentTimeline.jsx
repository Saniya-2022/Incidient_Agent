import React from 'react';
import {
  AlertTriangle,
  Sparkles,
  Search,
  CheckCircle2,
  UserCheck,
  Zap,
  BrainCircuit,
  Clock,
} from 'lucide-react';

export default function IncidentTimeline({ timeline = [] }) {
  const getTimelineIcon = (status, title = '') => {
    const t = (title + ' ' + (status || '')).toLowerCase();
    if (t.includes('detect') || t.includes('alert')) {
      return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
    }
    if (t.includes('ai') || t.includes('hypothes') || t.includes('cause')) {
      return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
    }
    if (t.includes('retriev') || t.includes('similar')) {
      return <Search className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (t.includes('engineer') || t.includes('assign')) {
      return <UserCheck className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (t.includes('resolution') || t.includes('applied') || t.includes('action')) {
      return <Zap className="w-3.5 h-3.5 text-indigo-400" />;
    }
    if (t.includes('memory') || t.includes('hindsight') || t.includes('outcome')) {
      return <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (t.includes('resolved')) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    }
    return <Clock className="w-3.5 h-3.5 text-gray-400" />;
  };

  const getBorderColor = (status, title = '') => {
    const t = (title + ' ' + (status || '')).toLowerCase();
    if (t.includes('detect')) return 'border-red-500/40 bg-red-950/40';
    if (t.includes('ai') || t.includes('cause')) return 'border-purple-500/40 bg-purple-950/40';
    if (t.includes('retriev')) return 'border-blue-500/40 bg-blue-950/40';
    if (t.includes('assign')) return 'border-amber-500/40 bg-amber-950/40';
    if (t.includes('memory') || t.includes('resolved')) return 'border-emerald-500/40 bg-emerald-950/40';
    return 'border-border bg-card';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider font-mono">
          Incident Lifecycle Timeline
        </h4>
        <span className="text-[11px] font-mono text-gray-400">Chronological</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
        {timeline.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-0 w-5 h-5 rounded-full border flex items-center justify-center -translate-x-1/2 ${getBorderColor(
                item.status,
                item.title
              )}`}
            >
              {getTimelineIcon(item.status, item.title)}
            </div>

            {/* Content */}
            <div className="pl-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-gray-200">
                  {item.time}
                </span>
                <span className="text-xs font-medium text-gray-300">
                  {item.title}
                </span>
              </div>
              {item.desc && (
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
