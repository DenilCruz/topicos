import { httpClient } from '@/shared/http/client';
import { ApiResponse } from '@/shared/types/common.types';
import { LoginCredentials, LoginResponseData, User } from '../types/auth.types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponseData> => {
    const response = await httpClient.post<ApiResponse<LoginResponseData>>('/auth/login/', credentials);
    return response.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await httpClient.get<ApiResponse<User>>('/auth/me/');
    return response.data.data;
  },

  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    const response = await httpClient.post<{ access: string }>('/auth/refresh/', { refresh });
    return response.data;
  },
};
