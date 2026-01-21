import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import thTH from 'antd/locale/th_TH';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './components/DashboardLayout';
import ProjectsPage from './pages/ProjectsPage';
import StaffPage from './pages/StaffPage';
import RosterPage from './pages/RosterPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={thTH}>
        <BrowserRouter>
          <Routes>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard/projects" replace />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="roster" element={<RosterPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard/projects" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
