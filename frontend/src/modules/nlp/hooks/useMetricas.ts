import { useEffect, useState } from 'react';
import axios from 'axios';
import { nlpApi } from '../services/nlpApi';
import { ComparacionModelos } from '../types/nlp.types';

export function useMetricas() {
  const [datos, cambiarDatos] = useState<ComparacionModelos | null>(null);
  const [cargando, cambiarCarga] = useState(true);
  const [error, cambiarError] = useState('');
  const [intento, cambiarIntento] = useState(0);
  useEffect(() => {
    let vigente = true;
    cambiarCarga(true);
    cambiarError('');
    nlpApi.consultarMetricas().then(resultado => {
      if (vigente) cambiarDatos(resultado);
    }).catch((fallo: unknown) => {
      if (!vigente) return;
      const detalle = axios.isAxiosError(fallo) ? fallo.response?.data?.error : null;
      cambiarError(detalle?.message || detalle?.details?.detail || 'No se pudieron cargar las métricas. Comprueba tu sesión y la conexión.');
    }).finally(() => { if (vigente) cambiarCarga(false); });
    return () => { vigente = false; };
  }, [intento]);

 return { datos, cargando, error, reintentar: () => cambiarIntento(valor => valor + 1) };
}
