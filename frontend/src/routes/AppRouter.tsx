import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { LoginForm } from '@/modules/autenticacion/components/LoginForm';
import { NlpDashboard } from '@/modules/nlp/components/NlpDashboard';
import { LogsDashboard } from '@/modules/logs/components/LogsDashboard';
import { TicketsDashboard } from '@/modules/tickets/components/TicketsDashboard';
import { ReportsLayout } from '@/modules/reports/components/ReportsLayout';
import { StaticReports } from '@/modules/reports/components/StaticReports';
import { VoiceReport } from '@/modules/reports/components/VoiceReport';
import { VisualDashboard } from '@/modules/reports/components/VisualDashboard';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />

      {/* Rutas protegidas por módulo */}
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <TicketsDashboard />
          </ProtectedRoute>
        }
      />

      {/* Módulo de reportes: layout con submenú y una vista por subruta */}
      <Route
        path="/reportes"
        element={
          <ProtectedRoute>
            <ReportsLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="estaticos" replace />} />
        <Route path="estaticos" element={<StaticReports />} />
        <Route path="voz" element={<VoiceReport />} />
        <Route path="dashboard" element={<VisualDashboard />} />
      </Route>

      <Route
        path="/nlp"
        element={
          <ProtectedRoute>
            <NlpDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/logs"
        element={
          <ProtectedRoute requiredRole="AUDITOR">
            <LogsDashboard />
          </ProtectedRoute>
        }
      />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  );
};
