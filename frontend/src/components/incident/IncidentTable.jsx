import React from 'react';
import IncidentRow from './IncidentRow';
import EmptyState from '../common/EmptyState';
import LoadingSkeleton from '../common/LoadingSkeleton';

export default function IncidentTable({
  incidents,
  isLoading,
  onResetFilters,
}) {
  if (isLoading) {
    return <LoadingSkeleton type="table" rows={6} />;
  }

  if (!incidents || incidents.length === 0) {
    return (
      <EmptyState
        title="No incidents match the filters"
        description="Try adjusting your severity, status, or search terms to locate records."
        actionLabel="Clear Filters"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#0e1422] text-[11px] font-semibold text-gray-400 uppercase tracking-wider font-mono">
              <th className="py-3 px-4">Incident ID</th>
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-4">Title / Error Signature</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Detected</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {incidents.map((incident) => (
              <IncidentRow key={incident.id} incident={incident} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 bg-[#0e1422] border-t border-border flex items-center justify-between text-xs text-gray-400 font-mono">
        <span>Showing {incidents.length} incidents</span>
        <span>Telemetry Stream: Active</span>
      </div>
    </div>
  );
}
