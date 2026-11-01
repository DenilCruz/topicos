import React, { useEffect, useState } from 'react';
import type { Ticket } from '@/modules/tickets/types/tickets.types';
import { reportsApi } from '../services/reportsApi';
import { ReportTicketFilters } from '../types/reports.types';
import { exportTicketsToCsv, exportTicketsToPdf, openPrintWindow } from '../utils/export';

const ESTADOS = ['PENDIENTE_DIAGNOSTICO', 'DIAGNOSTICADO', 'EN_PROCESO', 'RESUELTO'];
const PRIORIDADES = ['Alta', 'Media', 'Baja'];
const PAGE_SIZES = [10, 25, 50];

const describeFilters = (f: ReportTicketFilters) => {
  const parts = [
    f.estado && `estado ${f.estado}`,
    f.prioridad && `prioridad ${f.prioridad}`,
    f.fechaInicio && `desde ${f.fechaInicio}`,
    f.fechaFin && `hasta ${f.fechaFin}`,
  ].filter(Boolean);
  return parts.length ? `Filtros: ${parts.join(', ')}` : 'Sin filtros';
};

export const StaticReports: React.FC = () => {
  const [filters, setFilters] = useState<ReportTicketFilters>({ page: 1, size: 10 });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    reportsApi
      .getTicketsPage(filters)
      .then((data) => {
        if (cancelled) return;
        setTickets(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      })
      .catch((err: any) => !cancelled && setError(err?.response?.data?.error?.message || 'Error al obtener el historial.'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [filters]);

  const updateFilters = (changes: Partial<ReportTicketFilters>) => setFilters((prev) => ({ ...prev, ...changes, page: 1 }));
  const page = filters.page || 1;
  const { page: _p, size: _s, ...exportFilters } = filters;

  const handleCsv = async () => {
    setExporting('csv');
    setError(null);
    try {
      exportTicketsToCsv(await reportsApi.getAllTickets(exportFilters));
    } catch {
      setError('No fue posible exportar a CSV.');
    } finally {
      setExporting(null);
    }
  };

  const handlePdf = async () => {
    const win = openPrintWindow();
    if (!win) {
      setError('El navegador bloqueó la ventana emergente. Permite ventanas emergentes para exportar a PDF.');
      return;
    }
    setExporting('pdf');
    setError(null);
    try {
      exportTicketsToPdf(win, await reportsApi.getAllTickets(exportFilters), describeFilters(filters));
    } catch {
      win.close();
      setError('No fue posible exportar a PDF.');
    } finally {
      setExporting(null);
    }
  };

  const cell: React.CSSProperties = { padding: '12px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem' }}>Reportes Estáticos</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Historial de incidentes con exportación del resultado filtrado.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handlePdf} disabled={exporting !== null || totalElements === 0}
            style={{ backgroundColor: 'var(--danger)', color: '#fff', opacity: exporting || totalElements === 0 ? 0.6 : 1 }}>
            {exporting === 'pdf' ? 'Generando PDF...' : 'Exportar a PDF'}
          </button>
          <button onClick={handleCsv} disabled={exporting !== null || totalElements === 0}
            style={{ backgroundColor: 'var(--success)', color: '#fff', opacity: exporting || totalElements === 0 ? 0.6 : 1 }}>
            {exporting === 'csv' ? 'Generando CSV...' : 'Exportar a CSV'}
          </button>
        </div>
      </div>

      {/* Filtros en una sola fila sobre la tabla */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px' }}>
        <select value={filters.estado || ''} onChange={(e) => updateFilters({ estado: e.target.value || undefined })}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.prioridad || ''} onChange={(e) => updateFilters({ prioridad: e.target.value || undefined })}>
          <option value="">Todas las prioridades</option>
          {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Desde
          <input type="date" value={filters.fechaInicio || ''} onChange={(e) => updateFilters({ fechaInicio: e.target.value || undefined })} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Hasta
          <input type="date" value={filters.fechaFin || ''} onChange={(e) => updateFilters({ fechaFin: e.target.value || undefined })} />
        </label>
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#450a0a', color: '#f87171', borderRadius: '6px' }}>{error}</div>}

      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={cell}>ID</th>
              <th style={cell}>Fecha/Hora</th>
              <th style={cell}>Título</th>
              <th style={cell}>Dispositivo</th>
              <th style={cell}>Estado</th>
              <th style={cell}>Categoría (ML)</th>
              <th style={cell}>Prioridad</th>
              <th style={cell}>Usuario</th>
            </tr>
          </thead>
          <tbody style={{ opacity: loading && tickets.length ? 0.5 : 1 }}>
            {loading && tickets.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center' }}>Cargando historial...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay incidentes para estos filtros.</td></tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...cell, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>#{t.id}</td>
                  <td style={cell}>{new Date(t.fechaCreacion).toLocaleString()}</td>
                  <td style={cell} title={t.descripcion}>{t.titulo}</td>
                  <td style={cell}>{t.dispositivoNombre || '-'}</td>
                  <td style={cell}>{t.estado}</td>
                  <td style={{ ...cell, fontFamily: 'monospace' }}>
                    {t.categoria ? `${t.categoria}${t.probabilidad !== null ? ` (${(t.probabilidad * 100).toFixed(1)}%)` : ''}` : <span style={{ color: 'var(--text-secondary)' }}>Sin diagnóstico</span>}
                  </td>
                  <td style={cell}>{t.prioridad || '-'}</td>
                  <td style={cell}>{t.usuarioNombre || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Filas por página
          <select value={filters.size} onChange={(e) => updateFilters({ size: Number(e.target.value) })}>
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span>· {totalElements} incidente(s)</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setFilters((f) => ({ ...f, page: page - 1 }))} disabled={page <= 1 || loading}
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', opacity: page <= 1 ? 0.5 : 1 }}>
            Anterior
          </button>
          <span>Página {totalPages === 0 ? 0 : page} de {totalPages}</span>
          <button onClick={() => setFilters((f) => ({ ...f, page: page + 1 }))} disabled={page >= totalPages || loading}
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', opacity: page >= totalPages ? 0.5 : 1 }}>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};
