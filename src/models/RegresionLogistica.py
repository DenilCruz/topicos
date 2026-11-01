"""Clasificador lineal que estima probabilidades por categoría."""
from sklearn.linear_model import LogisticRegression
from .configuracion import SEMILLA


def crear_regresion_logistica():
    return LogisticRegression(max_iter=2000, random_state=SEMILLA)
