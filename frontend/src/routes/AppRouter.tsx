import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { LoginForm } from '@/modules/autenticacion/components/LoginForm';
import { BonitaDashboard } from '@/modules/bonita/components/BonitaDashboard';
import { NlpDashboard } from '@/modules/nlp/components/NlpDashboard';
import { LogsDashboard } from '@/modules/logs/components/LogsDashboard';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />

      {/* Rutas protegidas por módulo */}
      <Route
        path="/bonita"
        element={
          <ProtectedRoute>
            <BonitaDashboard />
          </ProtectedRoute>
        }
      />

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
      <Route path="*" element={<Navigate to="/bonita" replace />} />
    </Routes>
  );
};
