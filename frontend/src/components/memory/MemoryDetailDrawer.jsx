import React, { useEffect } from 'react';
import { X, BrainCircuit, CheckCircle2, XCircle, BookOpen, User, Calendar, ExternalLink } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';

export default function MemoryDetailDrawer({ isOpen, onClose, memoryItem, onViewRunbook }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !memoryItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-xl bg-[#0D1222] border-l border-border h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border bg-[#090D18] flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-950/80 border border-purple-800/60 rounded-lg text-purple-300">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-purple-400">
                  {memoryItem.incidentId || memoryItem.id}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
                  {memoryItem.outcome || 'Resolved'}
                </span>
                {memoryItem.severity && <SeverityBadge severity={memoryItem.severity} size="xs" />}
              </div>
              <h3 className="text-sm font-semibold text-gray-100 mt-1 leading-snug">
                {memoryItem.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const md = `# Incident Post-Mortem: ${memoryItem.incidentId || memoryItem.id} - ${memoryItem.title}
**Service:** ${memoryItem.service}
**Date:** ${memoryItem.date}
**Outcome:** ${memoryItem.outcome || 'Resolved'}
**Verified By:** ${memoryItem.verifiedBy || 'Alex Chen'}

## 1. Root Cause Analysis
${memoryItem.rootCause}

## 2. Applied Resolution
${memoryItem.resolution}

## 3. What Worked
${memoryItem.whatWorked || 'Applied recommended mitigations.'}

## 4. What Failed
${memoryItem.whatFailed || 'Initial attempts without queue clearing.'}

## 5. Lessons Learned & Prevention
${memoryItem.lessonsLearned || 'Early alerts on metric saturation.'}

## 6. Runbook Referenced
${memoryItem.runbook || 'N/A'}
`;
                navigator.clipboard.writeText(md);
                alert('Incident Post-Mortem copied to clipboard in Markdown format!');
              }}
              className="px-2.5 py-1 text-[11px] font-mono rounded bg-[#151D2E] hover:bg-card border border-border text-gray-300 hover:text-white transition-colors"
              title="Copy Post-Mortem as Markdown"
            >
              Export Markdown
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-card transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata pill bar */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#111827] border border-border text-xs font-mono">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Service</span>
              <span className="text-gray-200">{memoryItem.service}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Indexed Date</span>
              <span className="text-gray-200">{memoryItem.date}</span>
            </div>
          </div>

          {/* Root Cause */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-purple-400">
              Root Cause Identification
            </span>
            <div className="p-3.5 rounded-lg bg-[#151D2E] border border-border text-xs text-gray-200 leading-relaxed font-mono">
              {memoryItem.rootCause}
            </div>
          </div>

          {/* Resolution */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Applied Resolution
            </span>
            <div className="p-3.5 rounded-lg bg-[#151D2E] border border-border text-xs text-gray-200 leading-relaxed">
              {memoryItem.resolution}
            </div>
          </div>

          {/* What Worked & What Failed */}
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>What Worked</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {memoryItem.whatWorked || 'Applied suggested configuration tuning and verified stability.'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-800/30 space-y-1">
              <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold font-mono">
                <XCircle className="w-4 h-4" />
                <span>What Failed</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {memoryItem.whatFailed || 'Premature node restart before clearing message queues.'}
              </p>
            </div>
          </div>

          {/* Lessons Learned */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400">
              ★ Lessons Learned & Architectural Prevention
            </span>
            <div className="p-3.5 rounded-lg bg-[#151D2E] border border-border text-xs text-amber-200/90 leading-relaxed">
              {memoryItem.lessonsLearned || 'No specific post-mortem lessons attached.'}
            </div>
          </div>

          {/* Engineer Notes */}
          {memoryItem.engineerNotes && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400">
                Engineer Post-Mortem Notes
              </span>
              <p className="text-xs text-gray-300 leading-relaxed p-3 rounded-lg bg-[#111827] border border-border italic">
                "{memoryItem.engineerNotes}"
              </p>
            </div>
          )}

          {/* Runbook Reference */}
          {memoryItem.runbook && (
            <div className="p-3 rounded-lg bg-[#151D2E] border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-xs font-mono font-semibold text-gray-200">
                    Runbook: {memoryItem.runbook}
                  </span>
                  <p className="text-[11px] text-gray-400">Associated recovery procedure</p>
                </div>
              </div>
              {onViewRunbook && (
                <button
                  onClick={() => onViewRunbook(memoryItem.runbook)}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-card hover:bg-gray-800 border border-border text-purple-300 transition-colors"
                >
                  Inspect SOP
                </button>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border bg-[#090D18] flex items-center justify-between text-xs text-gray-400 font-mono">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-gray-500" />
            <span>Verified By: {memoryItem.verifiedBy || 'Alex Chen'}</span>
          </div>
          <span className="text-purple-400">Hindsight Vector ID: {memoryItem.id}</span>
        </div>
      </div>
    </div>
  );
}
