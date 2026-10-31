import React from 'react';
import { useTickets } from '../hooks/useTickets';
import { TicketForm } from './TicketForm';

const ESTADOS = ['PENDIENTE_DIAGNOSTICO', 'DIAGNOSTICADO', 'EN_PROCESO', 'RESUELTO'];
const PRIORIDADES = ['Alta', 'Media', 'Baja'];

export const TicketsDashboard: React.FC = () => {
  const {
    tickets, dispositivos, loading, error, filters, totalElements, totalPages,
    updateFilters, goToPage, createTicket, refresh,
  } = useTickets();

  const currentPage = filters.page || 1;

  const getPrioridadColor = (prioridad: string | null) => {
    switch (prioridad) {
      case 'Alta':
        return 'var(--danger)';
      case 'Media':
        return 'var(--warning)';
      case 'Baja':
        return 'var(--success)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'RESUELTO':
        return 'var(--success)';
      case 'PENDIENTE_DIAGNOSTICO':
        return 'var(--warning)';
      default:
        return 'var(--primary)';
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Gestión de Tickets e Incidentes</h1>
        <button onClick={refresh} style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          Refrescar
        </button>
      </div>

      <TicketForm dispositivos={dispositivos} onSubmit={createTicket} />

      {/* Barra de Filtros */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        backgroundColor: 'var(--bg-secondary)',
        padding: '1rem',
        borderRadius: '6px'
      }}>
        <input
          type="text"
          placeholder="Categoría..."
          value={filters.categoria || ''}
          onChange={(e) => updateFilters({ categoria: e.target.value || undefined })}
        />

        <select
          value={filters.prioridad || ''}
          onChange={(e) => updateFilters({ prioridad: e.target.value || undefined })}
        >
          <option value="">Todas las prioridades</option>
          {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <select
          value={filters.estado || ''}
          onChange={(e) => updateFilters({ estado: e.target.value || undefined })}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Desde
          <input
            type="date"
            value={filters.fechaInicio || ''}
            onChange={(e) => updateFilters({ fechaInicio: e.target.value || undefined })}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Hasta
          <input
            type="date"
            value={filters.fechaFin || ''}
            onChange={(e) => updateFilters({ fechaFin: e.target.value || undefined })}
          />
        </label>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#450a0a', color: '#f87171', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {/* Tabla de Tickets */}
      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Fecha/Hora</th>
              <th style={{ padding: '12px' }}>Título</th>
              <th style={{ padding: '12px' }}>Dispositivo</th>
              <th style={{ padding: '12px' }}>Estado</th>
              <th style={{ padding: '12px' }}>Categoría (ML)</th>
              <th style={{ padding: '12px' }}>Prioridad</th>
              <th style={{ padding: '12px' }}>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center' }}>Cargando tickets...</td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No se encontraron tickets.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>#{ticket.id}</td>
                  <td style={{ padding: '12px' }}>{new Date(ticket.fechaCreacion).toLocaleString()}</td>
                  <td style={{ padding: '12px' }} title={ticket.descripcion}>{ticket.titulo}</td>
                  <td style={{ padding: '12px' }}>{ticket.dispositivoNombre || '-'}</td>
                  <td style={{ padding: '12px', color: getEstadoColor(ticket.estado), fontWeight: 'bold' }}>{ticket.estado}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                    {ticket.categoria ? (
                      <>
                        {ticket.categoria}
                        {ticket.probabilidad !== null && ` (${(ticket.probabilidad * 100).toFixed(1)}%)`}
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>Sin diagnóstico</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: getPrioridadColor(ticket.prioridad), fontWeight: 'bold' }}>
                    {ticket.prioridad || '-'}
                  </td>
                  <td style={{ padding: '12px' }}>{ticket.usuarioNombre || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        <span>{totalElements} ticket(s) en total</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', opacity: currentPage <= 1 ? 0.5 : 1 }}
          >
            Anterior
          </button>
          <span>Página {totalPages === 0 ? 0 : currentPage} de {totalPages}</span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', opacity: currentPage >= totalPages ? 0.5 : 1 }}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};
