import React, { useEffect, useState } from 'react';
import { BonitaContractInput } from '../types/bonita.types';

interface ContractFormProps {
  /** Carga las entradas del contrato (proceso o tarea). */
  loadContract: () => Promise<BonitaContractInput[]>;
  submitLabel: string;
  /** Devuelve un mensaje de error o null si todo salió bien. */
  onSubmit: (values: Record<string, any>) => Promise<string | null>;
  onCancel: () => void;
}

const NUMERIC_TYPES = ['LONG', 'INTEGER', 'DECIMAL'];
const DATE_TYPES = ['DATE', 'LOCALDATE'];

/** Convierte el valor del input al tipo que espera el contrato de Bonita. */
const coerce = (input: BonitaContractInput, raw: any): any => {
  if (input.type === 'BOOLEAN') return Boolean(raw);
  if (raw === '' || raw === undefined) return null;
  if (input.type === 'LONG' || input.type === 'INTEGER') return parseInt(raw, 10);
  if (input.type === 'DECIMAL') return parseFloat(raw);
  return raw;
};

export const ContractForm: React.FC<ContractFormProps> = ({ loadContract, submitLabel, onSubmit, onCancel }) => {
  const [inputs, setInputs] = useState<BonitaContractInput[] | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadContract()
      .then(setInputs)
      .catch((err: any) => {
        setInputs([]);
        setError(err?.response?.data?.error?.message || 'No fue posible obtener el contrato.');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs) return;
    setSubmitting(true);
    setError(null);
    const payload = Object.fromEntries(inputs.map((input) => [input.name, coerce(input, values[input.name])]));
    const result = await onSubmit(payload);
    setSubmitting(false);
    if (result) setError(result);
  };

  if (inputs === null) {
    return <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1rem' }}>Cargando contrato...</p>;
  }

  const unsupported = inputs.filter((i) => i.multiple || !(NUMERIC_TYPES.includes(i.type) || DATE_TYPES.includes(i.type) || ['TEXT', 'BOOLEAN'].includes(i.type)));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
      {inputs.length === 0 && !error && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Este contrato no requiere datos.</p>
      )}

      {inputs.filter((i) => !unsupported.includes(i)).map((input) => (
        <label key={input.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
          <span>
            {input.name} <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({input.type})</span>
          </span>
          {input.type === 'BOOLEAN' ? (
            <input
              type="checkbox"
              checked={Boolean(values[input.name])}
              onChange={(e) => setValues((v) => ({ ...v, [input.name]: e.target.checked }))}
              style={{ width: 'auto' }}
            />
          ) : (
            <input
              type={NUMERIC_TYPES.includes(input.type) ? 'number' : DATE_TYPES.includes(input.type) ? 'date' : 'text'}
              step={input.type === 'DECIMAL' ? 'any' : undefined}
              placeholder={input.description || ''}
              value={values[input.name] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [input.name]: e.target.value }))}
              required
            />
          )}
        </label>
      ))}

      {unsupported.length > 0 && (
        <p style={{ color: 'var(--warning)', fontSize: '0.75rem' }}>
          Entradas no soportadas en este formulario: {unsupported.map((i) => i.name).join(', ')}
        </p>
      )}

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#450a0a', color: '#f87171', borderRadius: '6px', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="submit"
          disabled={submitting}
          style={{ flex: 1, backgroundColor: 'var(--primary)', color: '#fff', opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? 'Enviando...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          Cancelar
        </button>
      </div>
    </form>
  );
};
