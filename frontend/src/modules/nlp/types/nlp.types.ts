export interface SentimentResult {
  label: 'POSITIVO' | 'NEGATIVO' | 'NEUTRO';
  score: number;
  tokens_count: number;
}

export interface EntityResult {
  text: string;
  start: number;
  end: number;
  type: string;
}

export interface NlpAnalysisResponse {
  text_length: number;
  sentiment: SentimentResult;
  entities: EntityResult[];
  summary: string;
}
