export interface PasosNlp {
  texto_original: string;
  texto_normalizado: string;
  tokens: string[];
  palabras_eliminadas: string[];
  tokens_sin_palabras_vacias: string[];
  metodo: string;
  tokens_procesados: string[];
  ngramas: string[];
  rango_ngramas: number[];
  caracteristicas_tfidf: { termino: string; peso: number }[];
}

export interface NlpAnalysisResponse {
  categoria_predecida: string;
  probabilidad: number;
  tiempo_inferencia_ms: number;
  preprocesamiento: PasosNlp;
}
