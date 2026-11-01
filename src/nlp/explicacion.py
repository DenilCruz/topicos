"""Desglose del preprocesamiento y de los pesos del pipeline ajustado."""
from .pipeline import explicar_preprocesamiento
from .N_gramas import generar_ngramas


def explicar_pipeline_entrenado(pipeline, texto):
    preprocesador = pipeline.named_steps['preprocesamiento']
    pasos = explicar_preprocesamiento(
        texto, preprocesador.metodo, preprocesador.modelo_idioma,
        preprocesador.palabras_agregadas, preprocesador.palabras_conservadas)
    contador = pipeline.named_steps['ngramas']
    pesos = pipeline.named_steps['tfidf'].transform(contador.transform([pasos['texto_procesado']])).tocsr()
    nombres = contador.get_feature_names_out()
    pasos['ngramas'] = generar_ngramas(pasos['tokens_procesados'], contador.ngram_range)
    pasos['rango_ngramas'] = list(contador.ngram_range)
    pasos['caracteristicas_tfidf'] = sorted(
        [{'termino': str(nombres[indice]), 'peso': float(peso)}
         for indice, peso in zip(pesos.indices, pesos.data)],
        key=lambda elemento: elemento['peso'], reverse=True)[:30]
    return pasos
