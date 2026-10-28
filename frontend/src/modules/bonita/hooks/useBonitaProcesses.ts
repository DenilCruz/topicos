import { useState, useEffect } from 'react';
import { BonitaProcess, BonitaTask } from '../types/bonita.types';
import { bonitaApi } from '../services/bonitaApi';

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
      setError(err?.response?.data?.error?.message || 'Error al cargar datos de Bonita.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startProcess = async (processId: string) => {
    await bonitaApi.startCase(processId);
    await fetchData();
  };

  const completeTask = async (taskId: string) => {
    await bonitaApi.executeTask(taskId);
    await fetchData();
  };

  return { processes, tasks, loading, error, refresh: fetchData, startProcess, completeTask };
};
