"""Clasificador probabilístico compatible con los pesos no negativos de TF-IDF."""
from sklearn.naive_bayes import MultinomialNB


def crear_naive_bayes():
    return MultinomialNB()
