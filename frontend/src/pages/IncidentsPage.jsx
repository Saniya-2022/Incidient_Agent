import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, Plus } from 'lucide-react';
import IncidentTable from '../components/incident/IncidentTable';
import CreateIncidentModal from '../components/incident/CreateIncidentModal';
import { getIncidents } from '../services/api';
import { useApp } from '../context/AppContext';

export default function IncidentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshTrigger, addToast } = useApp();
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => { const q = searchParams.get('search'); if (q !== null) setSearchQuery(q); }, [searchParams]);

  useEffect(() => {
    setIsLoading(true);
    getIncidents({ search: searchQuery, severity: severityFilter, status: statusFilter })
      .then(d => setIncidents(d || []))
      .catch(e => console.error(e))
      .finally(() => setIsLoading(false));
  }, [searchQuery, severityFilter, statusFilter, refreshTrigger]);

  const handleReset = () => { setSearchQuery(''); setSeverityFilter('All'); setStatusFilter('All'); setSearchParams({}); };
  const handleCreated = inc => {
    setIncidents(p => [inc, ...p]);
    setShowCreate(false);
    addToast && addToast({ title: 'Incident Reported', message: `"${inc.title}" created.`, type: 'success' });
  };

  const severities = ['All','Critical','High','Medium','Low'];
  const statuses   = ['All','Open','In Progress','Resolved'];
  const hasFilters = searchQuery || severityFilter !== 'All' || statusFilter !== 'All';

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Incidents</h1>
          <p className="text-sm text-slate-500 mt-0.5">{incidents.length} recorded · real-time production incidents</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors shadow-sm shrink-0">
          <Plus className="w-4 h-4" />Report Incident
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search incidents..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" />
          </div>
          {hasFilters && (
            <button onClick={handleReset} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Severity:</span>
            <div className="flex gap-1 bg-slate-50 p-0.5 rounded-xl border border-slate-200">
              {severities.map(s => (
                <button key={s} onClick={() => setSeverityFilter(s)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${severityFilter === s ? 'bg-white text-violet-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status:</span>
            <div className="flex gap-1 bg-slate-50 p-0.5 rounded-xl border border-slate-200">
              {statuses.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-white text-violet-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <IncidentTable incidents={incidents} isLoading={isLoading} onResetFilters={handleReset} />
      <CreateIncidentModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
    </div>
  );
}
