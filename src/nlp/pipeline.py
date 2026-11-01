"""Preprocesamiento compartido y vectorización ajustable con scikit-learn."""

from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline

from .Normalizacion import normalizar_texto
from .Tokenizacion import tokenizar_texto
from .Stopwords import obtener_palabras_vacias, eliminar_palabras_vacias
from .StemmingLematizacion import obtener_lemas, obtener_raices
from .N_gramas import crear_contador_ngramas
from .TF_IDF import crear_transformador_tfidf


def explicar_preprocesamiento(texto, metodo="stemming", modelo_idioma="es_core_news_sm",
                             palabras_agregadas=(), palabras_conservadas=()):
    """Devuelve los pasos reales usados al transformar el texto para TF-IDF."""
    normalizado = normalizar_texto(texto)
    tokens = tokenizar_texto(normalizado)
    vacias = obtener_palabras_vacias(palabras_agregadas, palabras_conservadas)
    filtrados = eliminar_palabras_vacias(tokens, vacias)
    if metodo == "stemming":
        resultado = obtener_raices(filtrados)
    elif metodo == "lematizacion":
        # Lematizar con contexto antes de retirar palabras vacías evita perder
        # información gramatical necesaria para desambiguar las palabras.
        lemas = obtener_lemas(tokens, modelo_idioma)
        if len(lemas) != len(tokens):
            raise ValueError("La tokenización del lematizador no coincide con la del pipeline.")
        resultado = [lema for token, lema in zip(tokens, lemas) if token not in vacias]
    else:
        raise ValueError("El método debe ser 'stemming' o 'lematizacion'.")
    return {
        "texto_original": texto, "texto_normalizado": normalizado,
        "tokens": tokens, "palabras_eliminadas": [t for t in tokens if t in vacias],
        "tokens_sin_palabras_vacias": filtrados, "metodo": metodo,
        "tokens_procesados": resultado, "texto_procesado": " ".join(resultado),
    }


class PreprocesadorEspanol(TransformerMixin, BaseEstimator):
    """Transformador serializable y compatible con validación cruzada.

    fit y transform conservan sus nombres porque son el contrato de sklearn.
    No se aprende vocabulario aquí: TF-IDF lo aprende únicamente en fit.
    """

    def __init__(self, metodo="stemming", modelo_idioma="es_core_news_sm",
                 palabras_agregadas=(), palabras_conservadas=()):
        self.metodo = metodo
        self.modelo_idioma = modelo_idioma
        self.palabras_agregadas = palabras_agregadas
        self.palabras_conservadas = palabras_conservadas

    def fit(self, textos, y=None):
        return self

    def transform(self, textos):
        if isinstance(textos, str):
            raise TypeError("Entrega una lista de textos, no un texto suelto.")
        return [explicar_preprocesamiento(
            texto, self.metodo, self.modelo_idioma,
            self.palabras_agregadas, self.palabras_conservadas,
        )["texto_procesado"] for texto in textos]


def crear_pipeline_nlp(metodo="stemming", rango_ngramas=(1, 2),
                       maximo_vocabulario=10000, frecuencia_minima=1,
                       frecuencia_maxima=1.0, modelo_idioma="es_core_news_sm",
                       palabras_agregadas=(), palabras_conservadas=()):
    """Crea un pipeline sin entrenar; (1, 1) usa unigramas y (1, 2) añade bigramas."""
    return Pipeline([
        ("preprocesamiento", PreprocesadorEspanol(
            metodo, modelo_idioma, palabras_agregadas, palabras_conservadas)),
        ("ngramas", crear_contador_ngramas(
            rango_ngramas=rango_ngramas, maximo_vocabulario=maximo_vocabulario,
            frecuencia_minima=frecuencia_minima, frecuencia_maxima=frecuencia_maxima,
        )),
        ("tfidf", crear_transformador_tfidf()),
    ])
