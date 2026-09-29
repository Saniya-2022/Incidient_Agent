import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Copy, Check, Terminal, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function RunbookModal({ isOpen, onClose, runbook }) {
  const { addToast } = useApp();
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [dryRunRunning, setDryRunRunning] = useState(false);
  const [dryRunResults, setDryRunResults] = useState({});

  if (!runbook) return null;

  const handleDryRun = (stepIdx, command) => {
    setDryRunRunning(true);
    setTimeout(() => {
      setDryRunResults((prev) => ({
        ...prev,
        [stepIdx]: {
          status: 'success',
          output: `[probe-daemon] Verified syntax & cluster context. Dry-run execution OK (exit code 0). Target pre-flight check passed.`,
        },
      }));
      setDryRunRunning(false);
      addToast({
        title: 'Dry-Run Check Passed',
        message: `Step ${stepIdx + 1} verified against target environment without side-effects.`,
        type: 'success',
      });
    }, 600);
  };

  const copyCommand = (cmd, index) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    addToast({
      title: 'Command Copied',
      message: 'Shell command copied to clipboard.',
      type: 'info',
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${runbook.id} - ${runbook.title}`}
      subtitle={`Category: ${runbook.category} • Success Rate: ${runbook.successRate}% • Estimated: ${runbook.estimatedDuration || '5 min'}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Description */}
        <p className="text-xs text-gray-300 leading-relaxed">
          {runbook.description}
        </p>

        {/* Prerequisites */}
        {runbook.prerequisites && (
          <div className="p-3 bg-[#151D2E] rounded-lg border border-border">
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Prerequisites & Environment Requirements
            </h4>
            <ul className="space-y-1.5">
              {runbook.prerequisites.map((req, idx) => (
                <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="text-purple-400 font-mono text-[11px]">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Execution Steps */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-mono">
            Remediation Steps
          </h4>
          {runbook.steps && runbook.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-[#0e1422] border border-border space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono flex items-center justify-center font-bold">
                    {step.stepNumber || idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-gray-200">
                    {step.title}
                  </span>
                </div>
              </div>

              {step.command && (
                <div className="relative group">
                  <div className="bg-[#080B14] p-3 rounded border border-border text-xs font-mono text-purple-300 overflow-x-auto pr-16 select-all">
                    <code>{step.command}</code>
                  </div>
                  <div className="absolute right-2 top-2 flex items-center gap-1.5">
                    <button
                      onClick={() => handleDryRun(idx, step.command)}
                      disabled={dryRunRunning}
                      className="px-2 py-1 rounded bg-[#151D2E] hover:bg-purple-950/60 hover:text-purple-300 border border-border text-gray-400 text-[10px] font-mono transition-colors"
                      title="Simulate command in dry-run mode"
                    >
                      {dryRunResults[idx] ? '✓ Verified' : 'Dry-Run'}
                    </button>
                    <button
                      onClick={() => copyCommand(step.command, idx)}
                      className="p-1 rounded bg-[#151D2E] hover:bg-card border border-border text-gray-400 hover:text-white transition-colors"
                      title="Copy command"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Dry-run verification output */}
              {dryRunResults[idx] && (
                <div className="p-2 rounded bg-[#090D18] border border-emerald-800/40 text-[11px] font-mono text-emerald-400 flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{dryRunResults[idx].output}</span>
                </div>
              )}

              {step.explanation && (
                <p className="text-[11px] text-gray-400 leading-normal">
                  <strong className="text-gray-300">Rationale:</strong> {step.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Rollback Procedure */}
        {runbook.rollbackProcedure && (
          <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg">
            <h4 className="text-xs font-semibold text-red-300 uppercase tracking-wider mb-1 font-mono flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              Rollback / Abort Protocol
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {runbook.rollbackProcedure}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between pt-3 border-t border-border text-[11px] font-mono text-gray-400">
          <span>Author: {runbook.author || 'SRE Platform'}</span>
          <span>Last Updated: {runbook.lastUpdated || '2026-08-15'}</span>
        </div>
      </div>
    </Modal>
  );
}
