"""Evalúa casos de revisión sin ajustar ni reemplazar el modelo guardado."""
import csv
import hashlib
import json
from pathlib import Path

import joblib
from src.nlp.Normalizacion import normalizar_texto
from .evaluacion import evaluar_modelo


def analizar_errores():
    raiz = Path(__file__).resolve().parents[2]
    ruta_modelo = raiz / 'artifacts/pipeline.joblib'
    ruta_casos = raiz / 'data/evaluacion/casos_revision.csv'
    with ruta_casos.open(encoding='utf-8-sig', newline='') as archivo:
        casos = list(csv.DictReader(archivo))
    with (raiz / 'data/raw/incidentes_es.csv').open(encoding='utf-8-sig', newline='') as archivo:
        conocidos = {normalizar_texto(fila['texto']) for fila in csv.DictReader(archivo)}
    assert not any(normalizar_texto(caso['texto']) in conocidos for caso in casos)
    pipeline = joblib.load(ruta_modelo)
    textos = [caso['texto'] for caso in casos]
    etiquetas = [caso['categoria'] for caso in casos]
    informe = evaluar_modelo(pipeline, textos, etiquetas)
    predicciones = pipeline.predict(textos)
    probabilidades = pipeline.predict_proba(textos)
    detalles = []
    for caso, prediccion, probabilidades_caso in zip(casos, predicciones, probabilidades):
        pasos = pipeline.named_steps['preprocesamiento'].transform([caso['texto']])
        vector = pipeline.named_steps['ngramas'].transform(pasos)
        detalles.append({**caso, 'prediccion': str(prediccion),
                         'acierto': str(prediccion) == caso['categoria'],
                         'probabilidad': float(max(probabilidades_caso)),
                         'terminos_reconocidos': int(vector.nnz)})
    informe.update({'casos': detalles, 'modelo_sha256': hashlib.sha256(ruta_modelo.read_bytes()).hexdigest(),
                    'casos_sha256': hashlib.sha256(ruta_casos.read_bytes()).hexdigest(),
                    'origen': '18 casos sintéticos elaborados con asistencia de IA; etiquetas pendientes de revisión técnica humana.'})
    salida = raiz / 'artifacts/analisis_errores.json'
    salida.write_text(json.dumps(informe, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"Aciertos: {sum(c['acierto'] for c in detalles)}/{len(casos)}")
    for caso in detalles:
        if not caso['acierto']:
            print(caso['categoria'], '->', caso['prediccion'], caso['texto'])


if __name__ == '__main__':
    analizar_errores()
