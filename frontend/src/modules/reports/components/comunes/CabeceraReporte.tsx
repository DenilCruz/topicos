import { ReactNode } from 'react';
export function CabeceraReporte({ titulo, descripcion, children }: { titulo: string; descripcion: string; children?: ReactNode }) {
  return <header className="reporte-cabecera"><div><h2>{titulo}</h2><p>{descripcion}</p></div>
    <div className="reporte-acciones">{children}</div></header>;
}
