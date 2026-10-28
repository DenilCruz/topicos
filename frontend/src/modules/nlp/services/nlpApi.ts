import { httpClient } from '@/shared/http/client';
import { ApiResponse } from '@/shared/types/common.types';
import { NlpAnalysisResponse } from '../types/nlp.types';

export const nlpApi = {
  analyzeText: async (text: string): Promise<NlpAnalysisResponse> => {
    const response = await httpClient.post<ApiResponse<NlpAnalysisResponse>>('/nlp/analyze/', { text });
    return response.data.data;
  },
};
