"""Construcción y ajuste de los dos modelos con las mismas particiones."""
from collections import Counter
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.pipeline import Pipeline
from src.nlp.pipeline import crear_pipeline_nlp
from .RegresionLogistica import crear_regresion_logistica
from .NaiveBayes import crear_naive_bayes
from .configuracion import SEMILLA, PARTICIONES, METODOS, RANGOS_NGRAMAS, PARAMETROS_MODELOS


def entrenar_modelos(textos, etiquetas, metodos=METODOS):
    if not metodos or not set(metodos) <= set(METODOS):
        raise ValueError("Selecciona stemming, lematizacion o ambos.")
    if len(set(etiquetas)) < 2 or min(Counter(etiquetas).values()) < PARTICIONES:
        raise ValueError(f"El entrenamiento necesita al menos {PARTICIONES} ejemplos por categoría y dos categorías.")
    validacion = StratifiedKFold(n_splits=PARTICIONES, shuffle=True, random_state=SEMILLA)
    modelos = {"regresion_logistica": crear_regresion_logistica(),
               "naive_bayes": crear_naive_bayes()}
    resultados = {}
    for nombre, modelo in modelos.items():
        pipeline = Pipeline(crear_pipeline_nlp().steps + [("clasificador", modelo)])
        parametros = {
            "preprocesamiento__metodo": list(metodos),
            "ngramas__ngram_range": RANGOS_NGRAMAS,
            **PARAMETROS_MODELOS[nombre],
        }
        busqueda = GridSearchCV(pipeline, parametros, scoring="f1_macro", cv=validacion,
                               refit=True, n_jobs=1, error_score="raise")
        busqueda.fit(textos, etiquetas)
        resultados[nombre] = busqueda
    return resultados
