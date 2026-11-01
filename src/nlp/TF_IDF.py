"""Conversión de conteos de n-gramas en pesos TF-IDF."""

from sklearn.feature_extraction.text import TfidfTransformer


def crear_transformador_tfidf():
    """Aprende IDF en entrenamiento y normaliza cada documento con norma L2.

    Usa frecuencia de términos natural e IDF suavizado para evitar divisiones
    por cero. Recibe la matriz de conteos construida en N_gramas.py.
    """
    return TfidfTransformer(norm="l2", use_idf=True, smooth_idf=True,
                            sublinear_tf=False)
