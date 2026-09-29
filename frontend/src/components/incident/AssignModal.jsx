import React, { useState } from 'react';
import Modal from '../common/Modal';
import { UserCheck, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { assignIncident } from '../../services/api';

export default function AssignModal({ isOpen, onClose, incident, onAssigned }) {
  const { addToast } = useApp();
  const [selectedEngineer, setSelectedEngineer] = useState(incident?.assignee || 'Alex Chen');
  const [loading, setLoading] = useState(false);

  const team = [
    { name: 'Alex Chen', role: 'Staff SRE • Primary On-Call', active: true },
    { name: 'Rahul Verma', role: 'Security Engineering Lead', active: true },
    { name: 'Priya Sharma', role: 'Senior SRE • Platform', active: true },
    { name: 'Arjun Mehta', role: 'DevOps / Kubernetes Admin', active: false },
    { name: 'Elena Rostova', role: 'Data Platform Engineer', active: false },
  ];

  const handleAssign = async () => {
    setLoading(true);
    try {
      await assignIncident(incident.id, selectedEngineer);
      addToast({
        title: 'Engineer Assigned',
        message: `${selectedEngineer} is now handling ${incident.id}.`,
        type: 'info',
      });
      onAssigned(selectedEngineer);
      onClose();
    } catch (err) {
      addToast({
        title: 'Assignment Failed',
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
      title="Assign Incident Lead"
      subtitle={`Assign primary on-call engineer to ${incident?.id || 'incident'}`}
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-300">
          Select an available SRE responder to assume incident commander duties.
        </p>

        <div className="space-y-2">
          {team.map((eng) => (
            <label
              key={eng.name}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                selectedEngineer === eng.name
                  ? 'border-purple-500 bg-purple-950/30'
                  : 'border-border bg-card hover:bg-[#151D2E]'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="assignee"
                  value={eng.name}
                  checked={selectedEngineer === eng.name}
                  onChange={() => setSelectedEngineer(eng.name)}
                  className="accent-purple-500"
                />
                <div>
                  <p className="text-xs font-semibold text-gray-200">{eng.name}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{eng.role}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  eng.active
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                    : 'bg-gray-800/60 text-gray-400 border-gray-700'
                }`}
              >
                {eng.active ? 'Available' : 'Standby'}
              </span>
            </label>
          ))}
        </div>

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
            onClick={handleAssign}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-glow-ai transition-colors disabled:opacity-50"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{loading ? 'Assigning...' : 'Confirm Assignment'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
