import React from 'react';
import { useAuditLogs } from '../hooks/useAuditLogs';

export const LogsDashboard: React.FC = () => {
  const { logs, loading, error, filters, updateFilters, refresh } = useAuditLogs();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'ERROR':
      case 'CRITICAL':
        return 'var(--danger)';
      case 'WARNING':
        return 'var(--warning)';
      default:
        return 'var(--success)';
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Módulo de Auditoría y Logs</h1>
        <button onClick={refresh} style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          Refrescar
        </button>
      </div>

      {/* Barra de Filtros */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        padding: '1rem',
        borderRadius: '6px'
      }}>
        <select
          value={filters.severity || ''}
          onChange={(e) => updateFilters({ severity: e.target.value || undefined })}
        >
          <option value="">Todas las Severidades</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="ERROR">ERROR</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>

        <input
          type="text"
          placeholder="Filtrar por usuario..."
          value={filters.user || ''}
          onChange={(e) => updateFilters({ user: e.target.value || undefined })}
        />
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#450a0a', color: '#f87171', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {/* Tabla de Auditoría */}
      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px' }}>Fecha/Hora</th>
              <th style={{ padding: '12px' }}>Severidad</th>
              <th style={{ padding: '12px' }}>Método</th>
              <th style={{ padding: '12px' }}>Ruta</th>
              <th style={{ padding: '12px' }}>Estado</th>
              <th style={{ padding: '12px' }}>Duración</th>
              <th style={{ padding: '12px' }}>Usuario</th>
              <th style={{ padding: '12px' }}>IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center' }}>Cargando logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No se encontraron registros de auditoría.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '12px', color: getSeverityColor(log.severity), fontWeight: 'bold' }}>
                    {log.severity}
                  </td>
                  <td style={{ padding: '12px' }}>{log.method}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>{log.path}</td>
                  <td style={{ padding: '12px' }}>{log.status_code}</td>
                  <td style={{ padding: '12px' }}>{log.duration_ms} ms</td>
                  <td style={{ padding: '12px' }}>{log.user_identifier || 'Anon'}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{log.ip_address || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
