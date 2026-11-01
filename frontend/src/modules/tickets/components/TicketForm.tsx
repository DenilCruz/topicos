import React, { useState } from 'react';
import { CreateTicketPayload, Dispositivo } from '../types/tickets.types';

const DESCRIPCION_MIN = 10;
const DESCRIPCION_MAX = 2000;

interface TicketFormProps {
  dispositivos: Dispositivo[];
  onSubmit: (payload: CreateTicketPayload) => Promise<string | null>;
}

export const TicketForm: React.FC<TicketFormProps> = ({ dispositivos, onSubmit }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [dispositivoId, setDispositivoId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const longitud = descripcion.trim().length;
  const descripcionValida = longitud >= DESCRIPCION_MIN && longitud <= DESCRIPCION_MAX;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!descripcionValida) {
      setError(`La descripción debe tener entre ${DESCRIPCION_MIN} y ${DESCRIPCION_MAX} caracteres.`);
      return;
    }
    setSubmitting(true);
    const result = await onSubmit({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      dispositivoId: Number(dispositivoId),
    });
    setSubmitting(false);
    if (result) {
      setError(result);
    } else {
      setSuccess('Ticket registrado con estado PENDIENTE_DIAGNOSTICO.');
      setTitulo('');
      setDescripcion('');
      setDispositivoId('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        padding: '1.5rem',
        borderRadius: '8px',
      }}
    >
      <h3>Reportar incidente</h3>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={255}
          required
          style={{ flex: '2 1 240px' }}
        />
        <select
          value={dispositivoId}
          onChange={(e) => setDispositivoId(e.target.value)}
          required
          style={{ flex: '1 1 200px' }}
        >
          <option value="">Selecciona un dispositivo</option>
          {dispositivos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.ubicacion ? `${d.nombre} — ${d.ubicacion}` : d.nombre}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <textarea
          placeholder="Describe la falla en lenguaje natural (p. ej. 'El switch del piso 2 tiene puertos bloqueados por spanning tree')"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
          required
          style={{ resize: 'vertical' }}
        />
        <span style={{ fontSize: '0.75rem', color: descripcion && !descripcionValida ? 'var(--danger)' : 'var(--text-secondary)' }}>
          {longitud} / {DESCRIPCION_MAX} caracteres (mínimo {DESCRIPCION_MIN})
        </span>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#450a0a', color: '#f87171', borderRadius: '6px' }}>{error}</div>
      )}
      {success && (
        <div style={{ padding: '0.75rem', backgroundColor: '#052e16', color: 'var(--success)', borderRadius: '6px' }}>{success}</div>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          style={{ backgroundColor: 'var(--primary)', color: '#fff', opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? 'Registrando...' : 'Registrar ticket'}
        </button>
      </div>
    </form>
  );
};
