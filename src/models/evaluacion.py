"""Evaluación final sobre ejemplos que no participaron en el ajuste."""
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


def evaluar_modelo(pipeline, textos, etiquetas):
    predicciones = pipeline.predict(textos)
    categorias = pipeline.classes_.tolist()
    return {
        "accuracy": float(accuracy_score(etiquetas, predicciones)),
        "reporte": classification_report(etiquetas, predicciones, labels=categorias,
                                         output_dict=True, zero_division=0),
        "categorias": categorias,
        "matriz_confusion": confusion_matrix(etiquetas, predicciones, labels=categorias).tolist(),
        "errores": [{"texto": texto, "categoria_real": real, "categoria_predicha": str(predicha)}
                    for texto, real, predicha in zip(textos, etiquetas, predicciones)
                    if real != predicha],
    }
