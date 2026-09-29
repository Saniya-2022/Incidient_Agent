import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const cfg = {
  success:  { icon: CheckCircle2, bg: 'bg-white', border: 'border-l-emerald-500', icon_c: 'text-emerald-500', title_c: 'text-slate-800' },
  critical: { icon: AlertTriangle, bg: 'bg-white', border: 'border-l-red-500',     icon_c: 'text-red-500',     title_c: 'text-slate-800' },
  warning:  { icon: AlertTriangle, bg: 'bg-white', border: 'border-l-amber-500',   icon_c: 'text-amber-500',   title_c: 'text-slate-800' },
  info:     { icon: Info,          bg: 'bg-white', border: 'border-l-blue-500',    icon_c: 'text-blue-500',    title_c: 'text-slate-800' },
  ai:       { icon: Zap,           bg: 'bg-white', border: 'border-l-violet-500',  icon_c: 'text-violet-500',  title_c: 'text-slate-800' },
};

function Toast({ toast, onRemove }) {
  const c = cfg[toast.type] || cfg.info;
  const Icon = c.icon;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${c.bg} border border-slate-200 border-l-4 ${c.border} shadow-lg min-w-[300px] max-w-sm`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${c.icon_c}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${c.title_c}`}>{toast.title}</p>
        {toast.message && <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={()=>onRemove(toast.id)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map(t => <Toast key={t.id} toast={t} onRemove={removeToast} />)}
    </div>
  );
}
