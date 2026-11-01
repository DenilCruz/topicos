"""Construcción de unigramas y bigramas y conteo de sus apariciones."""

from sklearn.feature_extraction.text import CountVectorizer


def generar_ngramas(tokens: list[str], rango_ngramas=(1, 2)) -> list[str]:
    """Ejemplo: ['falla', 'red'] produce ['falla', 'red', 'falla red']."""
    minimo, maximo = rango_ngramas
    if minimo < 1 or maximo < minimo:
        raise ValueError("El rango de n-gramas debe cumplir 1 <= mínimo <= máximo.")
    return [" ".join(tokens[inicio:inicio + longitud])
            for longitud in range(minimo, maximo + 1)
            for inicio in range(len(tokens) - longitud + 1)]


def crear_contador_ngramas(rango_ngramas=(1, 2), maximo_vocabulario=10000,
                           frecuencia_minima=1, frecuencia_maxima=1.0):
    """Aprende vocabulario y cuenta términos solo durante el ajuste.

    CountVectorizer genera las mismas secuencias consecutivas que
    generar_ngramas. (1, 1) usa unigramas; (1, 2) añade bigramas.
    Las frecuencias mínima y máxima son frecuencias de documentos.
    """
    return CountVectorizer(
        tokenizer=str.split, token_pattern=None, lowercase=False,
        ngram_range=rango_ngramas, max_features=maximo_vocabulario,
        min_df=frecuencia_minima, max_df=frecuencia_maxima,
    )
