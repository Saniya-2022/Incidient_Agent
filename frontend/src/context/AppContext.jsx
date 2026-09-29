import React, { createContext, useContext, useState, useCallback } from 'react';
import { APP_CONFIG } from '../config';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [environment, setEnvironment] = useState(APP_CONFIG.defaultEnvironment);
  const [toasts, setToasts] = useState([]);
  const [systemStatus, setSystemStatus] = useState('All systems operational');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Active Monitored Project State (persisted in localStorage)
  const [currentProject, setCurrentProjectState] = useState(() => {
    try {
      const saved = localStorage.getItem('ir_current_project');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Active Upload / Analysis flow state
  // status: 'idle' | 'uploading' | 'analyzing' | 'ready' | 'error'
  const [uploadState, setUploadState] = useState({
    status: 'idle',
    progress: 0,
    projectData: null,
    error: null,
  });

  const setCurrentProject = useCallback((project) => {
    setCurrentProjectState(project);
    try {
      if (project) {
        localStorage.setItem('ir_current_project', JSON.stringify(project));
      } else {
        localStorage.removeItem('ir_current_project');
      }
    } catch (e) {
      console.warn('Failed to save project to localStorage', e);
    }
  }, []);

  const clearCurrentProject = useCallback(() => {
    setCurrentProject(null);
    setUploadState({
      status: 'idle',
      progress: 0,
      projectData: null,
      error: null,
    });
  }, [setCurrentProject]);

  // Add toast notification
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast = {
      id,
      title: toast.title || 'Notification',
      message: toast.message || '',
      type: toast.type || 'info', // 'success', 'critical', 'warning', 'info', 'ai'
      duration: toast.duration || 4500,
    };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <AppContext.Provider
      value={{
        environment,
        setEnvironment,
        toasts,
        addToast,
        removeToast,
        systemStatus,
        setSystemStatus,
        refreshTrigger,
        triggerRefresh,
        currentProject,
        setCurrentProject,
        clearCurrentProject,
        uploadState,
        setUploadState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
