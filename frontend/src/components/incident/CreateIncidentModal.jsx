import React, { useState } from 'react';
import { AlertTriangle, Plus, FileText, Server, Zap } from 'lucide-react';
import Modal from '../common/Modal';
import { createIncident } from '../../services/api';

export default function CreateIncidentModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ title:'', service:'', severity:'medium', error_message:'', logs:'' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const upd = (f,v) => setForm(p=>({...p,[f]:v}));
  const reset = () => { setForm({title:'',service:'',severity:'medium',error_message:'',logs:''}); setError(''); };
  const handleClose = () => { if (!submitting) { reset(); onClose(); } };

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (!form.title.trim()) return setError('Incident title is required.');
    if (!form.service.trim()) return setError('Service name is required.');
    setSubmitting(true);
    try {
      const inc = await createIncident({ title:form.title.trim(), service:form.service.trim(), severity:form.severity, error_message:form.error_message.trim()||null, logs:form.logs.trim()||null });
      onCreated(inc); reset(); onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to create incident.');
    } finally { setSubmitting(false); }
  };

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Report New Incident" subtitle="Describe the incident so the AI agent can investigate it." maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
          </div>
        )}

        {/* Section 1: Incident Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="w-4 h-4 text-violet-500" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incident Information</h3>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={e=>upd('title',e.target.value)} placeholder="e.g. Payment API returning 503 errors" className={inputCls} />
            <p className="text-xs text-slate-400 mt-1">A clear, concise description of what went wrong.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service <span className="text-red-500">*</span></label>
              <input value={form.service} onChange={e=>upd('service',e.target.value)} placeholder="e.g. payment-api" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Severity</label>
              <select value={form.severity} onChange={e=>upd('severity',e.target.value)} className={inputCls}>
                <option value="critical">🔴 Critical — Full outage</option>
                <option value="high">🟠 High — Major impact</option>
                <option value="medium">🟡 Medium — Partial impact</option>
                <option value="low">🟢 Low — Minor issue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Error Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Server className="w-4 h-4 text-violet-500" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Error Details</h3>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Error Message</label>
            <textarea value={form.error_message} onChange={e=>upd('error_message',e.target.value)} rows={3} placeholder="e.g. java.lang.OutOfMemoryError: Java heap space" className={inputCls + ' resize-none'} />
          </div>
        </div>

        {/* Section 3: Logs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Zap className="w-4 h-4 text-violet-500" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logs & Evidence</h3>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Log Output</label>
            <textarea value={form.logs} onChange={e=>upd('logs',e.target.value)} rows={5} placeholder={"ERROR 09:15 GC overhead limit exceeded\nERROR 09:15 OutOfMemoryError in PaymentProcessor"} className={inputCls + ' resize-none font-mono text-xs'} />
            <p className="text-xs text-slate-400 mt-1">Paste relevant log lines — the AI agent will use these to identify the root cause.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={handleClose} disabled={submitting} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl disabled:opacity-50 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />{submitting ? 'Creating...' : 'Create Incident'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
