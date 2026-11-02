import { useState } from 'react';
import { AuditLogItem } from '../types/logs.types';
import { fechaLog } from '../utils/formato';

export function DetalleLog({ registro, cerrar }: { registro: AuditLogItem; cerrar: () => void }) {
  const [aviso, cambiarAviso] = useState('');
  async function copiar() {
    try { await navigator.clipboard.writeText(JSON.stringify(registro, null, 2)); cambiarAviso('Registro copiado.'); }
    catch { cambiarAviso('No se pudo acceder al portapapeles.'); }
  }
  return <section className="logs-detalle" aria-label="Detalle del registro seleccionado">
    <header><h2>Registro #{registro.id}</h2><button onClick={cerrar}>Cerrar detalle</button></header>
    <p>{fechaLog(registro.timestamp)} · {registro.method} · {registro.path}</p>
    <h3>Mensaje</h3><pre>{registro.message || 'Este registro no contiene un mensaje adicional.'}</pre>
    <button onClick={() => { void copiar(); }}>Copiar registro JSON</button><span role="status">{aviso}</span>
  </section>;
}
