import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';

// Pages
import DashboardPage from './pages/DashboardPage';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import InvestigationPage from './pages/InvestigationPage';
import MemoryPage from './pages/MemoryPage';
import RunbooksPage from './pages/RunbooksPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Dashboard */}
            <Route index element={<DashboardPage />} />

            {/* Incidents Queue */}
            <Route path="incidents" element={<IncidentsPage />} />

            {/* Incident Details */}
            <Route path="incidents/:id" element={<IncidentDetailPage />} />

            {/* AI Investigation Workflow */}
            <Route path="investigation/:id" element={<InvestigationPage />} />

            {/* Hindsight Memory */}
            <Route path="memory" element={<MemoryPage />} />

            {/* Runbooks Catalog */}
            <Route path="runbooks" element={<RunbooksPage />} />

            {/* Settings */}
            <Route path="settings" element={<SettingsPage />} />

            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
