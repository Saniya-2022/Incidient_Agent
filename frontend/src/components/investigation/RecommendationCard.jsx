import React, { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import AIConfidence from './AIConfidence';
import ApprovalModal from './ApprovalModal';

export default function RecommendationCard({
  investigation,
  onApprove,
  onReject,
  onViewRunbook,
}) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [rejected, setRejected] = useState(false);

  const handleApproveConfirm = () => {
    setShowApprovalModal(false);
    onApprove?.();
  };

  const handleRejectClick = () => {
    setRejected(true);
    onReject?.();
  };

  return (
    <>
      <div className="bg-[#121626] rounded-xl border border-purple-500/40 p-6 shadow-glow-ai relative overflow-hidden">
        {/* Top Safety Banner */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-4 mb-4 border-b border-border/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-950/80 border border-purple-800/60 text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-200 font-mono">
                  AI Recommendation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Human Approval Required
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Non-destructive remediation plan generated via Hindsight memory retrieval
              </p>
            </div>
          </div>
          <div className="w-48">
            <AIConfidence score={investigation?.confidenceScore || 94} />
          </div>
        </div>

        {/* Root Cause & Recommended Action */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
              Synthesized Root Cause
            </span>
            <h3 className="text-base font-bold text-gray-100">
              {investigation?.rootCause}
            </h3>
            {investigation?.rootCauseDetails && (
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {investigation.rootCauseDetails}
              </p>
            )}
          </div>

          <div className="p-4 rounded-lg bg-[#0B1020] border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300 font-semibold">
                Suggested Resolution Action
              </span>
              {investigation?.recommendedRunbook && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151D2E] text-gray-300 border border-border">
                  Estimated MTTR: {investigation.recommendedRunbook.estimatedTime || '4 min'}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-100 leading-snug">
              {investigation?.recommendedAction}
            </p>
          </div>

          {/* Reasoning Evidence list */}
          {investigation?.reasoningEvidence && (
            <div>
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block mb-2">
                Reasoning Evidence & Grounding
              </span>
              <ul className="space-y-2">
                {investigation.reasoningEvidence.map((evidence, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-gray-300 bg-[#151D2E]/50 p-2.5 rounded border border-border/70"
                  >
                    <span className="w-4 h-4 rounded-full bg-purple-950 border border-purple-800 text-purple-300 text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{evidence}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Runbook Reference Bar */}
          {investigation?.recommendedRunbook && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#151D2E] border border-border">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-xs font-mono font-bold text-gray-200">
                    {investigation.recommendedRunbook.id}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {investigation.recommendedRunbook.title}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onViewRunbook?.(investigation.recommendedRunbook.id)}
                className="px-2.5 py-1 text-xs font-mono rounded bg-[#111827] hover:bg-card border border-border text-gray-300 transition-colors"
              >
                Inspect SOP
              </button>
            </div>
          )}
        </div>

        {/* Safety Warning & Action Confirmation Footer */}
        <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-amber-400/90 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>AI cannot deploy changes to production without engineer sign-off.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleRejectClick}
              disabled={rejected}
              className="px-3.5 py-2 text-xs font-medium text-gray-400 hover:text-white bg-[#151D2E] hover:bg-card border border-border rounded-lg transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5 text-gray-400" />
              <span>{rejected ? 'Recommendation Rejected' : 'Reject'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowApprovalModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-glow-ai transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Approve Resolution</span>
            </button>
          </div>
        </div>
      </div>

      {/* Approval confirmation dialog */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onConfirm={handleApproveConfirm}
        investigation={investigation}
      />
    </>
  );
}
