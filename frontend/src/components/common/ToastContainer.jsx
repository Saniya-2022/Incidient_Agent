import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Sparkles, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-border';
        let bgClass = 'bg-card';
        let icon = <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;

        if (toast.type === 'success') {
          borderClass = 'border-low/40';
          bgClass = 'bg-[#0f1d22]';
          icon = <CheckCircle2 className="w-4 h-4 text-low shrink-0 mt-0.5" />;
        } else if (toast.type === 'critical') {
          borderClass = 'border-critical/40';
          bgClass = 'bg-[#1f1317]';
          icon = <AlertCircle className="w-4 h-4 text-critical shrink-0 mt-0.5" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-medium/40';
          bgClass = 'bg-[#1e1b12]';
          icon = <AlertTriangle className="w-4 h-4 text-medium shrink-0 mt-0.5" />;
        } else if (toast.type === 'ai') {
          borderClass = 'border-ai/40 shadow-glow-ai';
          bgClass = 'bg-[#151226]';
          icon = <Sparkles className="w-4 h-4 text-ai-light shrink-0 mt-0.5" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl text-sm ${bgClass} ${borderClass} transition-all duration-300 animate-in fade-in slide-in-from-bottom-3`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-200">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1 -mr-1 -mt-1 rounded"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
