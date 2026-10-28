import React from 'react';
import { useBonitaProcesses } from '../hooks/useBonitaProcesses';

export const BonitaDashboard: React.FC = () => {
  const { processes, tasks, loading, error, startProcess, completeTask, refresh } = useBonitaProcesses();

  if (loading) return <div style={{ padding: '2rem' }}>Cargando procesos de Bonita BPM...</div>;

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Módulo Bonita BPM</h1>
        <button onClick={refresh} style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          Actualizar
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#450a0a', color: '#f87171', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {/* Procesos Disponibles */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Procesos Disponibles</h2>
        {processes.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No hay procesos desplegados o activos.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {processes.map((proc) => (
              <div
                key={proc.id}
                style={{
                  border: '1px solid var(--border)',
                  padding: '1rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-primary)'
                }}
              >
                <h3>{proc.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Versión: {proc.version}</p>
                <button
                  onClick={() => startProcess(proc.id)}
                  style={{
                    marginTop: '1rem',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    width: '100%'
                  }}
                >
                  Iniciar Caso
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tareas Pendientes */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Tareas Humanas Pendientes</h2>
        {tasks.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No hay tareas pendientes en este momento.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-primary)'
                }}
              >
                <div>
                  <h4>{task.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Caso #{task.case_id}</span>
                </div>
                <button
                  onClick={() => completeTask(task.id)}
                  style={{ backgroundColor: 'var(--success)', color: '#fff' }}
                >
                  Completar Tarea
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
