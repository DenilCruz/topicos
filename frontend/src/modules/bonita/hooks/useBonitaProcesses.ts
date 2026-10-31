import { useState, useEffect } from 'react';
import { BonitaProcess, BonitaTask, BonitaCase } from '../types/bonita.types';
import { bonitaApi } from '../services/bonitaApi';

const extractError = (err: any, fallback: string): string =>
  err?.response?.data?.error?.message || fallback;

export const useBonitaProcesses = () => {
  const [processes, setProcesses] = useState<BonitaProcess[]>([]);
  const [tasks, setTasks] = useState<BonitaTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedProcesses, fetchedTasks] = await Promise.all([
        bonitaApi.getProcesses(),
        bonitaApi.getTasks(),
      ]);
      setProcesses(fetchedProcesses);
      setTasks(fetchedTasks);
    } catch (err: any) {
      setError(extractError(err, 'Error al cargar datos de Bonita.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Devuelven el error como texto para que el formulario lo muestre; lanzar dejaría el clic sin respuesta visible
  const startProcess = async (processId: string, variables: Record<string, any>): Promise<{ case?: BonitaCase; error?: string }> => {
    try {
      const created = await bonitaApi.startCase(processId, variables);
      await fetchData();
      return { case: created };
    } catch (err: any) {
      return { error: extractError(err, 'No fue posible iniciar el caso.') };
    }
  };

  const completeTask = async (taskId: string, variables: Record<string, any>): Promise<{ error?: string }> => {
    try {
      await bonitaApi.executeTask(taskId, variables);
      await fetchData();
      return {};
    } catch (err: any) {
      return { error: extractError(err, 'No fue posible completar la tarea.') };
    }
  };

  return { processes, tasks, loading, error, refresh: fetchData, startProcess, completeTask };
};
