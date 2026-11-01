import type { Ticket } from '@/modules/tickets/types/tickets.types';

interface Column {
  header: string;
  value: (t: Ticket) => string;
}

const COLUMNS: Column[] = [
  { header: 'ID', value: (t) => String(t.id) },
  { header: 'Fecha', value: (t) => new Date(t.fechaCreacion).toLocaleString('es-ES') },
  { header: 'Título', value: (t) => t.titulo },
  { header: 'Descripción', value: (t) => t.descripcion },
  { header: 'Dispositivo', value: (t) => t.dispositivoNombre || '' },
  { header: 'Estado', value: (t) => t.estado },
  { header: 'Categoría (ML)', value: (t) => t.categoria || '' },
  { header: 'Confianza', value: (t) => (t.probabilidad !== null ? `${(t.probabilidad * 100).toFixed(1)}%` : '') },
  { header: 'Prioridad', value: (t) => t.prioridad || '' },
  { header: 'Usuario', value: (t) => t.usuarioNombre || '' },
];

const timestamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

/** CSV con separador ';' y BOM UTF-8 para que Excel en español lo abra con columnas y acentos correctos. */
export const exportTicketsToCsv = (tickets: Ticket[]): void => {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = [
    COLUMNS.map((c) => escape(c.header)).join(';'),
    ...tickets.map((t) => COLUMNS.map((c) => escape(c.value(t))).join(';')),
  ];
  const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `historial-incidentes-${timestamp()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Abre una ventana imprimible; el diálogo del navegador permite "Guardar como PDF".
 * La ventana se abre antes de la carga de datos (en el mismo clic) para que no la bloquee el navegador.
 */
export const openPrintWindow = (): Window | null => {
  const win = window.open('', '_blank');
  if (win) win.document.write('<p style="font-family:sans-serif">Generando reporte...</p>');
  return win;
};

export const exportTicketsToPdf = (win: Window, tickets: Ticket[], subtitle: string): void => {
  const columns = COLUMNS.filter((c) => c.header !== 'Descripción');
  const body = tickets
    .map((t) => `<tr>${columns.map((c) => `<td>${escapeHtml(c.value(t))}</td>`).join('')}</tr>`)
    .join('');
  win.document.open();
  win.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Historial de incidentes ${timestamp()}</title>
<style>
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #0b0b0b; margin: 24px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  p { color: #52514e; font-size: 12px; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e1e0d9; }
  th { color: #52514e; font-weight: 600; }
  td:first-child { font-variant-numeric: tabular-nums; }
  @page { size: landscape; margin: 12mm; }
</style></head><body>
<h1>Mi Red · Historial de incidentes</h1>
<p>${escapeHtml(subtitle)} · ${tickets.length} ticket(s) · generado el ${escapeHtml(new Date().toLocaleString('es-ES'))}</p>
<table><thead><tr>${columns.map((c) => `<th>${escapeHtml(c.header)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>
</body></html>`);
  win.document.close();
  win.focus();
  win.print();
};
