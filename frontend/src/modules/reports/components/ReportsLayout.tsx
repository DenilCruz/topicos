import { NavLink, Outlet } from 'react-router-dom';
import '../styles/reportes.css';
const secciones = [
  { ruta: 'estaticos', titulo: 'Reportes estáticos', detalle: 'Historial y exportación', icono: '▤' },
  { ruta: 'voz', titulo: 'Análisis por voz', detalle: 'Resumen ejecutivo narrado', icono: '◉' },
  { ruta: 'dashboard', titulo: 'Dashboard visual', detalle: 'Indicadores y gráficos', icono: '▥' },
];
export function ReportsLayout() {
  return <main className="reportes-pagina">
    <header className="reportes-titulo"><span>Mi Red / Inteligencia operativa</span><h1>Módulo de Reportes</h1></header>
    <div className="reportes-layout"><nav className="reportes-menu" aria-label="Secciones de reportes">
      {secciones.map(seccion => <NavLink key={seccion.ruta} to={seccion.ruta}
        className={({ isActive }) => isActive ? 'activo' : ''}>
        <span className="reportes-icono" aria-hidden="true">{seccion.icono}</span>
        <span><strong>{seccion.titulo}</strong><small>{seccion.detalle}</small></span>
      </NavLink>)}
    </nav><div className="reportes-contenido"><Outlet /></div></div>
  </main>;
}
