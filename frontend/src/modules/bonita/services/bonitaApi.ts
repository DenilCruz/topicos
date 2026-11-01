import { httpClient } from '@/shared/http/client';
import { ApiResponse } from '@/shared/types/common.types';
import { BonitaProcess, BonitaCase, BonitaTask, BonitaContractInput } from '../types/bonita.types';

export const bonitaApi = {
  getProcesses: async (): Promise<BonitaProcess[]> => {
    const response = await httpClient.get<ApiResponse<BonitaProcess[]>>('/bonita/processes/');
    return response.data.data;
  },

  getProcessContract: async (processId: string): Promise<BonitaContractInput[]> => {
    const response = await httpClient.get<ApiResponse<BonitaContractInput[]>>(`/bonita/processes/${processId}/contract/`);
    return response.data.data;
  },

  startCase: async (processId: string, contractVariables?: Record<string, any>): Promise<BonitaCase> => {
    const response = await httpClient.post<ApiResponse<BonitaCase>>('/bonita/cases/start/', {
      process_id: processId,
      contract_variables: contractVariables || {},
    });
    return response.data.data;
  },

  getTasks: async (userId?: string): Promise<BonitaTask[]> => {
    const params = userId ? { user_id: userId } : {};
    const response = await httpClient.get<ApiResponse<BonitaTask[]>>('/bonita/tasks/', { params });
    return response.data.data;
  },

  getTaskContract: async (taskId: string): Promise<BonitaContractInput[]> => {
    const response = await httpClient.get<ApiResponse<BonitaContractInput[]>>(`/bonita/tasks/${taskId}/contract/`);
    return response.data.data;
  },

  executeTask: async (taskId: string, variables?: Record<string, any>): Promise<boolean> => {
    const response = await httpClient.post<ApiResponse<boolean>>('/bonita/tasks/execute/', {
      task_id: taskId,
      task_variables: variables || {},
    });
    return response.data.success;
  },
};
