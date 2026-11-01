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

export interface MetricasCategoria {
  precision: number;
  recall: number;
  'f1-score': number;
  support: number;
}

export interface EvaluacionModelo {
  accuracy: number;
  reporte: Record<string, MetricasCategoria | number>;
  categorias: string[];
  matriz_confusion: number[][];
}

export interface ComparacionModelos {
  modelo_elegido: string;
  criterio: string;
  cantidad_entrenamiento: number;
  cantidad_prueba: number;
  advertencia: string;
  modelos: Record<string, {
    f1_macro_validacion: number;
    mejores_parametros: Record<string, unknown>;
    prueba: EvaluacionModelo;
  }>;
  revision_adicional: (EvaluacionModelo & {
    origen: string;
    casos: { acierto: boolean }[];
  }) | null;
}
