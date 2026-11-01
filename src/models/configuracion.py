"""Parámetros compartidos para repetir y comparar los experimentos."""
SEMILLA = 42
PROPORCION_PRUEBA = 0.2
PARTICIONES = 3
METODOS = ("stemming", "lematizacion")
RANGOS_NGRAMAS = [(1, 1), (1, 2)]

# C controla la regularización; alpha suaviza las probabilidades de Naive Bayes.
PARAMETROS_MODELOS = {
    "regresion_logistica": {"clasificador__C": [0.1, 1.0, 10.0],
                           "clasificador__class_weight": [None, "balanced"]},
    "naive_bayes": {"clasificador__alpha": [0.1, 1.0, 5.0]},
}
