import { AuditLogItem } from '../types/logs.types';

export function exportarLogs(registros: AuditLogItem[]) {
  const columnas: (keyof AuditLogItem)[] = ['id', 'timestamp', 'severity', 'method', 'path', 'status_code', 'duration_ms', 'user_identifier', 'ip_address', 'message'];
  function celda(valor: unknown) {
    let texto = String(valor ?? '');
    if (/^[=+@\-\t\r]/.test(texto)) texto = `'${texto}`;
    return `"${texto.replace(/"/g, '""')}"`;
  }
  const filas = [columnas.map(celda).join(','), ...registros.map(registro => columnas.map(columna => celda(registro[columna])).join(','))];
  const enlace = document.createElement('a');
  const url = URL.createObjectURL(new Blob(['\ufeff' + filas.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  enlace.href = url; enlace.download = 'logs-pagina.csv'; enlace.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
