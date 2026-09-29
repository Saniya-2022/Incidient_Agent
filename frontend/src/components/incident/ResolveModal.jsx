import React, { useState } from 'react';
import Modal from '../common/Modal';
import { CheckCircle2, BrainCircuit, ShieldAlert, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { resolveIncident } from '../../services/api';

export default function ResolveModal({ isOpen, onClose, incident, onResolved }) {
  const { addToast, triggerRefresh } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    notes: 'Expanded database connection pool limit from 50 to 150 and performed rolling restart.',
    whatWorked: 'Increasing HikariCP max pool size immediately resolved connection timeouts.',
    whatFailed: 'Restarting pods without increasing pool size first caused immediate 503 errors.',
    lessonsLearned: 'Set alerting threshold at 80% connection pool saturation instead of 100%.',
    runbookId: 'DB-CONNECTION-POOL-01',
    storeInMemory: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resolveIncident(incident.id, formData);
      addToast({
        title: 'Incident Resolved',
        message: `${incident.id} marked as resolved. Outcome stored in Hindsight memory.`,
        type: 'success',
      });
      triggerRefresh();
      onResolved?.();
      onClose();
    } catch (err) {
      addToast({
        title: 'Resolution Error',
        message: err.message,
        type: 'critical',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Incident & Learn"
      subtitle={`Document resolution for ${incident?.id || 'incident'} (Concept: RESOLVE → LEARN)`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Safety Callout */}
        <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-lg flex items-start gap-3">
          <BrainCircuit className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-purple-300">Hindsight Memory Feedback Loop:</span>
            <p className="text-gray-300 mt-0.5">
              The details recorded below will be indexed in the vector store to help AI agents resolve similar future incidents faster.
            </p>
          </div>
        </div>

        {/* Resolution Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1 font-mono">
            Resolution Summary *
          </label>
          <textarea
            name="notes"
            rows={2}
            required
            value={formData.notes}
            onChange={handleChange}
            className="w-full bg-[#151D2E] border border-border rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-sans"
          />
        </div>

        {/* What Worked & What Failed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 font-mono">
              ✓ What Worked
            </label>
            <textarea
              name="whatWorked"
              rows={2}
              value={formData.whatWorked}
              onChange={handleChange}
              placeholder="What actions successfully restored service?"
              className="w-full bg-[#151D2E] border border-border rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-red-400 uppercase tracking-wider mb-1 font-mono">
              ✗ What Failed / Didn't Work
            </label>
            <textarea
              name="whatFailed"
              rows={2}
              value={formData.whatFailed}
              onChange={handleChange}
              placeholder="What actions were ineffective or counterproductive?"
              className="w-full bg-[#151D2E] border border-border rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-red-500 font-sans"
            />
          </div>
        </div>

        {/* Lessons Learned */}
        <div>
          <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 font-mono">
            ★ Lessons Learned & Prevention
          </label>
          <textarea
            name="lessonsLearned"
            rows={2}
            value={formData.lessonsLearned}
            onChange={handleChange}
            placeholder="Recommendations to avoid recurrence..."
            className="w-full bg-[#151D2E] border border-border rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500 font-sans"
          />
        </div>

        {/* Runbook selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1 font-mono">
              Associated Runbook
            </label>
            <input
              type="text"
              name="runbookId"
              value={formData.runbookId}
              onChange={handleChange}
              className="w-full bg-[#151D2E] border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-gray-200 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="storeInMemory"
                checked={formData.storeInMemory}
                onChange={handleChange}
                className="accent-purple-500 rounded"
              />
              <span className="text-xs text-gray-300 font-medium">
                Store outcome in Hindsight Memory
              </span>
            </label>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white bg-card hover:bg-[#151D2E] border border-border rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Resolving...' : 'Confirm Resolution'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
