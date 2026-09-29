import React from 'react';
import { Check, Clock, Sparkles } from 'lucide-react';

export default function InvestigationProgress({ steps = [], activeStep = 6 }) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-mono">
            AI Investigation Workflow
          </h4>
        </div>
        <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
          6-Stage Autonomous Pipeline
        </span>
      </div>

      <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
        {steps.map((item) => {
          const isDone = item.status === 'completed';
          const isPending = item.status === 'pending';

          return (
            <div key={item.step} className="relative group">
              {/* Step indicator circle */}
              <div
                className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center -translate-x-1/2 border transition-all ${
                  isDone
                    ? 'bg-purple-950 border-purple-500 text-purple-300'
                    : isPending
                    ? 'bg-[#151D2E] border-amber-500 text-amber-400 ring-2 ring-amber-500/20 animate-pulse'
                    : 'bg-[#151D2E] border-border text-gray-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" />
                ) : isPending ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                ) : (
                  <span className="text-[10px] font-mono">{item.step}</span>
                )}
              </div>

              {/* Step content */}
              <div className="pl-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold font-mono text-gray-200">
                      Stage {item.step}: {item.title}
                    </span>
                    {isPending && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                        Action Required
                      </span>
                    )}
                  </div>
                  {item.time && (
                    <span className="text-[10px] font-mono text-gray-400">
                      {item.time}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
