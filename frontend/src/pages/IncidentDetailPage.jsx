import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * IncidentDetailPage — redirects to the AI Investigation page.
 * The route /incidents/:id is kept for backward compatibility
 * (some components may still link here) but the real experience
 * lives at /investigation/:id.
 */
export default function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/investigation/' + id, { replace: true });
  }, [id, navigate]);

  // Brief loading state while the redirect fires
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Opening investigation...</p>
      </div>
    </div>
  );
}
