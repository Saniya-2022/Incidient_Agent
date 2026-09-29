import React, { useState } from 'react';
import Modal from '../common/Modal';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ApprovalModal({ isOpen, onClose, onConfirm, investigation }) {
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Engineer Approval Sign-off"
      subtitle={`Authorize remediation for ${investigation?.incidentId || 'incident'}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Production Authorization Confirmation:</span>
            <span>
              You are approving the execution of mitigation actions against the Production cluster.
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#151D2E] rounded-lg border border-border text-xs space-y-2">
          <div>
            <span className="text-[11px] font-mono text-gray-400 block">Proposed Action:</span>
            <span className="font-medium text-gray-200">{investigation?.recommendedAction}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono text-gray-400 block">Target SOP Runbook:</span>
            <span className="font-mono text-purple-300">
              {investigation?.recommendedRunbook?.id} - {investigation?.recommendedRunbook?.title}
            </span>
          </div>
        </div>

        <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0e1422] border border-border cursor-pointer">
          <input
            type="checkbox"
            checked={confirmedCheck}
            onChange={(e) => setConfirmedCheck(e.target.checked)}
            className="mt-0.5 accent-purple-500 rounded"
          />
          <span className="text-xs text-gray-300 leading-snug">
            I have reviewed the telemetry logs, confirmed the root cause hypothesis, and authorize this remediation.
          </span>
        </label>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white bg-card hover:bg-[#151D2E] border border-border rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!confirmedCheck}
            onClick={handleConfirm}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-glow-ai transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Confirm & Apply</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
