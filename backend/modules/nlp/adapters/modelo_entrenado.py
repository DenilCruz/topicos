"""Carga del pipeline completo y predicción sobre texto crudo."""
from functools import lru_cache
from time import perf_counter
import logging
import math

import joblib
from django.conf import settings
from rest_framework.exceptions import APIException

logger = logging.getLogger(__name__)


class ModeloNoDisponible(APIException):
    status_code = 503
    default_detail = 'El modelo no está disponible. Entrena el pipeline y reinicia el backend.'
    default_code = 'MODELO_NO_DISPONIBLE'


@lru_cache(maxsize=1)
def cargar_pipeline(ruta):
    """La primera solicitud carga el archivo; las siguientes reutilizan el objeto."""
    try:
        return joblib.load(ruta)
    except Exception as error:
        logger.exception('No se pudo cargar el pipeline de NLP.')
        raise ModeloNoDisponible() from error


def predecir_diagnostico(texto, pipeline=None):
    if pipeline is None:
        pipeline = cargar_pipeline(str(settings.NLP_PIPELINE_PATH))
    inicio = perf_counter()
    try:
        probabilidades = pipeline.predict_proba([texto])[0]
        indice = int(probabilidades.argmax())
        categoria = str(pipeline.classes_[indice])
        probabilidad = float(probabilidades[indice])
        if not categoria or len(categoria) > 100 or not math.isfinite(probabilidad) or not 0 <= probabilidad <= 1:
            raise ValueError('El modelo devolvió un diagnóstico inválido.')
    except Exception as error:
        logger.exception('No se pudo ejecutar la inferencia de NLP.')
        raise ModeloNoDisponible('No se pudo procesar el texto con el modelo configurado.') from error
    return {'categoria_predecida': categoria, 'probabilidad': round(probabilidad, 3),
            'tiempo_inferencia_ms': round((perf_counter() - inicio) * 1000)}
