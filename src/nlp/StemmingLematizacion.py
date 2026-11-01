"""Alternativas de reducción morfológica para comparar en entrenamiento."""

from functools import lru_cache

import spacy
from spacy.tokens import Doc
from nltk.stem.snowball import SpanishStemmer


def obtener_raices(tokens: list[str]) -> list[str]:
    """Aplica Snowball en español, sin descargar corpus de NLTK."""
    stemmer = SpanishStemmer()
    return [stemmer.stem(token) for token in tokens]


@lru_cache(maxsize=2)
def cargar_lematizador(nombre_modelo: str):
    """Carga el modelo una vez por proceso y conserva el análisis gramatical."""
    try:
        return spacy.load(nombre_modelo, disable=["parser", "ner"])
    except OSError as error:
        raise RuntimeError(
            f"Falta el modelo {nombre_modelo}. Instálalo con: "
            f"python -m spacy download {nombre_modelo}"
        ) from error


def obtener_lemas(tokens: list[str], nombre_modelo="es_core_news_sm") -> list[str]:
    """Analiza todos los tokens juntos para conservar el contexto lingüístico."""
    return list(lematizar_tokens_guardados(tuple(tokens), nombre_modelo))


@lru_cache(maxsize=10000)
def lematizar_tokens_guardados(tokens, nombre_modelo):
    """Reutiliza análisis lingüísticos idénticos entre experimentos.

    El modelo de idioma es fijo; esta memoria no aprende vocabulario ni etiquetas
    del dataset. TF-IDF sigue ajustándose por separado dentro de cada partición.
    """
    modelo = cargar_lematizador(nombre_modelo)
    documento = modelo(Doc(modelo.vocab, words=list(tokens)))
    return tuple(token.lemma_.lower() or token.text for token in documento if not token.is_space)
