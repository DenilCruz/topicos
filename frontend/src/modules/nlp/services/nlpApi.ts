import { httpClient } from '@/shared/http/client';
import { ApiResponse } from '@/shared/types/common.types';
import { NlpAnalysisResponse, ComparacionModelos } from '../types/nlp.types';

export const nlpApi = {
  consultarMetricas: async (): Promise<ComparacionModelos> => {
    const respuesta = await httpClient.get<ApiResponse<ComparacionModelos>>('/nlp/metricas/');
    return respuesta.data.data;
  },
  analyzeText: async (text: string): Promise<NlpAnalysisResponse> => {
    const response = await httpClient.post<ApiResponse<NlpAnalysisResponse>>('/nlp/predecir/', { texto: text });
    return response.data.data;
  },
};
