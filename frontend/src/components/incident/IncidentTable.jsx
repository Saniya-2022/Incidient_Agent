import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, AlertCircle } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';
import StatusBadge from '../common/StatusBadge';

function timeAgo(iso) {
  if (!iso) return '';
  const d = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (d < 1) return 'just now';
  if (d < 60) return d + 'm ago';
  const h = Math.floor(d / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded-lg animate-pulse" style={{ width: (60 + i * 10) + '%' }} /></td>
      ))}
    </tr>
  );
}

export default function IncidentTable({ incidents = [], isLoading, onResetFilters }) {
  const navigate = useNavigate();

  const goToInvestigation = (id) => navigate('/investigation/' + id);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Incident','Service','Severity','Status','Reported','Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    );
  }

  if (!incidents.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Search className="w-6 h-6 text-slate-400"/>
        </div>
        <h3 className="text-base font-semibold text-slate-700 mb-1">No incidents found</h3>
        <p className="text-sm text-slate-400 mb-4">Try adjusting your filters or report a new incident.</p>
        {onResetFilters && (
          <button onClick={onResetFilters} className="text-sm text-violet-600 hover:text-violet-700 font-medium">Clear filters</button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {['Incident','Service','Severity','Status','Reported','Action'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {incidents.map(inc => (
            <tr
              key={inc.id}
              className="hover:bg-violet-50/30 transition-colors group cursor-pointer"
              onClick={() => goToInvestigation(inc.id)}
            >
              <td className="px-4 py-3.5 max-w-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className={
                    'w-4 h-4 mt-0.5 shrink-0 ' +
                    (inc.severity === 'critical' ? 'text-red-500' :
                     inc.severity === 'high'     ? 'text-orange-500' :
                     inc.severity === 'medium'   ? 'text-amber-500' :
                                                   'text-emerald-500')
                  }/>
                  <div>
                    <p className="font-semibold text-slate-800 truncate max-w-[220px] group-hover:text-violet-700 transition-colors">{inc.title}</p>
                    {inc.error_message && (
                      <p className="text-xs text-slate-400 truncate max-w-[220px] mt-0.5 font-mono">{inc.error_message}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium font-mono">{inc.service}</span>
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap"><SeverityBadge severity={inc.severity}/></td>
              <td className="px-4 py-3.5 whitespace-nowrap"><StatusBadge status={inc.status}/></td>
              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-400">{timeAgo(inc.created_at)}</td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <button
                  onClick={e => { e.stopPropagation(); goToInvestigation(inc.id); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-100 transition-colors"
                >
                  <Sparkles className="w-3 h-3"/>Investigate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
