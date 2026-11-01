"""Punto de entrada: CSV etiquetado -> comparación -> pipeline y métricas."""
import argparse
import csv
import hashlib
import json
from collections import Counter
from importlib.metadata import version
from pathlib import Path

import joblib
from sklearn.model_selection import train_test_split
from src.nlp.Normalizacion import normalizar_texto
from src.nlp.StemmingLematizacion import cargar_lematizador
from .configuracion import SEMILLA, PROPORCION_PRUEBA, METODOS
from .entrenamiento import entrenar_modelos
from .evaluacion import evaluar_modelo


def cargar_dataset(ruta):
    """Exige texto y categoría; evita duplicados normalizados entre particiones."""
    textos, etiquetas, vistos = [], [], set()
    with Path(ruta).open(encoding="utf-8-sig", newline="") as archivo:
        lector = csv.DictReader(archivo)
        if not {"texto", "categoria"} <= set(lector.fieldnames or []):
            raise ValueError("El CSV debe contener las columnas texto y categoria.")
        for numero, fila in enumerate(lector, start=2):
            texto, categoria = (fila.get("texto") or "").strip(), (fila.get("categoria") or "").strip()
            normalizado = normalizar_texto(texto)
            if not normalizado or not categoria:
                raise ValueError(f"Fila {numero}: texto o categoría vacíos.")
            if normalizado in vistos:
                raise ValueError(f"Fila {numero}: texto duplicado; revisar antes de entrenar.")
            vistos.add(normalizado)
            textos.append(texto)
            etiquetas.append(categoria)
    if len(set(etiquetas)) < 2:
        raise ValueError("Se necesitan al menos dos categorías.")
    return textos, etiquetas


def ejecutar_entrenamiento(ruta_csv, carpeta_salida, metodos=METODOS):
    textos, etiquetas = cargar_dataset(ruta_csv)
    if "lematizacion" in metodos:
        cargar_lematizador("es_core_news_sm")
    indices_entrenamiento, indices_prueba = train_test_split(
        list(range(len(textos))), test_size=PROPORCION_PRUEBA,
        stratify=etiquetas, random_state=SEMILLA)
    textos_entrenamiento = [textos[i] for i in indices_entrenamiento]
    etiquetas_entrenamiento = [etiquetas[i] for i in indices_entrenamiento]
    textos_prueba = [textos[i] for i in indices_prueba]
    etiquetas_prueba = [etiquetas[i] for i in indices_prueba]
    resultados = entrenar_modelos(textos_entrenamiento, etiquetas_entrenamiento, metodos)
    # Elegimos antes de consultar prueba: sus métricas no deciden el ganador.
    ganador = max(resultados, key=lambda nombre: resultados[nombre].best_score_)
    informe = {
        "modelo_elegido": ganador, "criterio": "Mayor F1 macro de validación cruzada",
        "semilla": SEMILLA, "dataset_sha256": hashlib.sha256(Path(ruta_csv).read_bytes()).hexdigest(),
        "distribucion": dict(Counter(etiquetas)),
        "indices_entrenamiento": indices_entrenamiento, "indices_prueba": indices_prueba,
        "versiones": {nombre: version(nombre) for nombre in ["scikit-learn", "nltk", "spacy", "joblib"]},
        "modelos": {},
    }
    if "lematizacion" in metodos:
        informe["versiones"]["es_core_news_sm"] = version("es-core-news-sm")
    for nombre, busqueda in resultados.items():
        informe["modelos"][nombre] = {
            "f1_macro_validacion": float(busqueda.best_score_),
            "mejores_parametros": busqueda.best_params_,
            "experimentos": [{"parametros": parametros, "f1_macro_media": float(media),
                              "f1_macro_desviacion": float(desviacion)}
                             for parametros, media, desviacion in zip(
                                 busqueda.cv_results_["params"], busqueda.cv_results_["mean_test_score"],
                                 busqueda.cv_results_["std_test_score"])],
            "prueba": evaluar_modelo(busqueda.best_estimator_, textos_prueba, etiquetas_prueba),
        }
    salida = Path(carpeta_salida)
    salida.mkdir(parents=True, exist_ok=True)
    joblib.dump(resultados[ganador].best_estimator_, salida / "pipeline.joblib")
    (salida / "metricas.json").write_text(json.dumps(informe, ensure_ascii=False, indent=2), encoding="utf-8")
    return informe


def main():
    argumentos = argparse.ArgumentParser(description=__doc__)
    argumentos.add_argument("--datos", required=True, type=Path)
    argumentos.add_argument("--salida", type=Path, default=Path("artifacts"))
    argumentos.add_argument("--metodos", nargs="+", choices=METODOS, default=list(METODOS))
    opciones = argumentos.parse_args()
    try:
        informe = ejecutar_entrenamiento(opciones.datos, opciones.salida, opciones.metodos)
    except (ValueError, OSError, RuntimeError) as error:
        argumentos.error(str(error))
    print(f"Modelo elegido: {informe['modelo_elegido']}. Resultados en {opciones.salida}")


if __name__ == "__main__":
    main()
