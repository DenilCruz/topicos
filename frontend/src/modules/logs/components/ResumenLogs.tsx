import { RespuestaLogs } from '../types/logs.types';
import { duracionLog } from '../utils/formato';

export function ResumenLogs({ resumen }: { resumen: RespuestaLogs['resumen'] }) {
  const tarjetas = [['Registros filtrados', resumen.total], ['Errores HTTP (5xx)', resumen.errores],
    ['Advertencias HTTP (4xx)', resumen.advertencias],
    ['Duración media', resumen.duracion_media_ms === null ? 'Sin mediciones' : duracionLog(resumen.duracion_media_ms)]];
  return <div className="logs-resumen">{tarjetas.map(([titulo, valor]) =>
    <div key={titulo}><span>{titulo}</span><strong>{valor}</strong></div>)}</div>;
}
