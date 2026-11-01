"""Consultas de solo lectura sobre el modelo y sus resultados guardados."""
import json
import hashlib
from pathlib import Path

from django.conf import settings
from rest_framework.exceptions import APIException
from modules.nlp.adapters.modelo_entrenado import cargar_pipeline


class MetricasNoDisponibles(APIException):
    status_code = 503
    default_detail = 'Las métricas no están disponibles o tienen un formato inválido. Ejecuta el entrenamiento.'
    default_code = 'METRICAS_NO_DISPONIBLES'


def consultar_revision_adicional():
    """Solo muestra la revisión si pertenece al pipeline actualmente guardado."""
    try:
        ruta = Path(settings.NLP_METRICAS_PATH).parent / 'analisis_errores.json'
        revision = json.loads(ruta.read_text(encoding='utf-8'))
        huella = hashlib.sha256(Path(settings.NLP_PIPELINE_PATH).read_bytes()).hexdigest()
        if revision['modelo_sha256'] != huella:
            return None
        return {clave: revision[clave] for clave in
                ['accuracy', 'reporte', 'categorias', 'matriz_confusion', 'casos', 'origen']}
    except (OSError, UnicodeError, ValueError, KeyError, TypeError):
        return None


def consultar_metricas():
    """Lee el informe en cada consulta; no entrena ni modifica archivos."""
    try:
        informe = json.loads(Path(settings.NLP_METRICAS_PATH).read_text(encoding='utf-8'))
        modelos = informe['modelos']
        elegido = informe['modelo_elegido']
        if not isinstance(modelos, dict) or elegido not in modelos:
            raise ValueError('Falta el modelo elegido.')
        for resultado in modelos.values():
            if not isinstance(resultado['prueba']['reporte'], dict):
                raise ValueError('Falta el reporte de clasificación.')
            float(resultado['f1_macro_validacion'])
            float(resultado['prueba']['accuracy'])
        return {
            'modelo_elegido': elegido, 'criterio': informe['criterio'],
            'semilla': informe['semilla'], 'distribucion': informe['distribucion'],
            'cantidad_entrenamiento': len(informe['indices_entrenamiento']),
            'cantidad_prueba': len(informe['indices_prueba']),
            'modelos': modelos,
            'revision_adicional': consultar_revision_adicional(),
            'advertencia': 'Evaluación con datos sintéticos basados en plantillas. No representa rendimiento validado con incidentes reales.',
        }
    except (OSError, UnicodeError, ValueError, KeyError, TypeError) as error:
        raise MetricasNoDisponibles() from error


def consultar_estado():
    """Comprueba disponibilidad para inferencia sin consultar la base de datos.

    Reutiliza el pipeline en memoria. Reiniciar el backend al reemplazar el modelo.
    Una predicción de comprobación detecta artefactos cargables pero incompatibles.
    """
    try:
        pipeline = cargar_pipeline(str(settings.NLP_PIPELINE_PATH))
        probabilidades = pipeline.predict_proba(['Comprobación del estado del servicio de red.'])
        if probabilidades.shape != (1, len(pipeline.classes_)):
            raise ValueError('Respuesta de modelo incompatible.')
        disponible = True
    except Exception:
        disponible = False
    return {
        'servicio_activo': True,
        'pipeline_disponible': disponible,
        'estado': 'listo' if disponible else 'modelo_no_disponible',
    }
