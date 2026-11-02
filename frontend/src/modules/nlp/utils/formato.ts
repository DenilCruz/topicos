import { EvaluacionModelo, MetricasCategoria } from '../types/nlp.types';
export const porcentaje = (valor: number) => `${(valor * 100).toLocaleString('es', { maximumFractionDigits: 1 })} %`;
export const nombreModelo = (nombre: string) => ({ regresion_logistica: 'Regresión logística', naive_bayes: 'Naive Bayes' }[nombre] || nombre);
export const nombreCategoria = (nombre: string) => nombre.replace(/_/g, ' ');
export function promedio(evaluacion: EvaluacionModelo): MetricasCategoria {
  return evaluacion.reporte['macro avg'] as MetricasCategoria;
}
