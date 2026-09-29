import React from 'react';
import { useNavigate } from 'react-router-dom';
import SeverityBadge from '../common/SeverityBadge';
import StatusBadge from '../common/StatusBadge';
import { Sparkles, ChevronRight, User } from 'lucide-react';

export default function IncidentRow({ incident, onAssignClick }) {
  const navigate = useNavigate();

  return (
    <tr
      onClick={() => navigate(`/incidents/${incident.id}`)}
      className="border-b border-border/70 hover:bg-[#151D2E]/80 cursor-pointer transition-colors group text-xs"
    >
      {/* Incident ID */}
      <td className="py-3 px-4 font-mono font-semibold text-purple-400 group-hover:text-purple-300">
        <span className="inline-flex items-center gap-1.5">
          {incident.id}
        </span>
      </td>

      {/* Service */}
      <td className="py-3 px-4 font-medium text-gray-200">
        <span className="px-2 py-0.5 rounded bg-[#151D2E] border border-border text-gray-300 font-mono text-[11px]">
          {incident.service}
        </span>
      </td>

      {/* Title / Error */}
      <td className="py-3 px-4 max-w-xs md:max-w-md">
        <div className="font-medium text-gray-100 truncate">{incident.title}</div>
        <div className="text-[11px] font-mono text-gray-400 truncate mt-0.5">
          {incident.error}
        </div>
      </td>

      {/* Severity */}
      <td className="py-3 px-4 whitespace-nowrap">
        <SeverityBadge severity={incident.severity} />
      </td>

      {/* Status */}
      <td className="py-3 px-4 whitespace-nowrap">
        <StatusBadge status={incident.status} />
      </td>

      {/* Detected */}
      <td className="py-3 px-4 text-gray-400 font-mono whitespace-nowrap">
        {incident.detected}
      </td>

      {/* Assignee */}
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-gray-300">
          <div className="w-5 h-5 rounded-full bg-gray-800 border border-border flex items-center justify-center text-[10px] text-gray-300 font-mono">
            {incident.assignee ? incident.assignee.substring(0, 2).toUpperCase() : '?'}
          </div>
          <span>{incident.assignee || 'Unassigned'}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/investigation/${incident.id}`)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-800/60 shadow-glow-ai transition-colors"
            title="Investigate with AI Agent"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">Investigate</span>
          </button>
          <button
            onClick={() => navigate(`/incidents/${incident.id}`)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="View details"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
