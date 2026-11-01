# Dataset traducido para el prototipo

`raw/incidentes_es.csv` tiene únicamente `texto` y `categoria`, compatibles con el
cargador de entrenamiento actual.

Fuente declarada: https://huggingface.co/datasets/codingkiddo/smartnet-network-incidents
La captura de su ficha indica datos sintéticos en inglés y licencia Apache-2.0;
conservar y verificar la ficha y licencia originales antes de publicar la entrega.

Preparación realizada el 1 de noviembre de 2026:

- Se reunieron 6000 filas de los tres CSV convertidos desde Parquet.
- Traducción local de 12 plantillas con asistencia de IA, conservando cifras y
  unidades. La traducción no utiliza la etiqueta para decidir el contenido.
- Las seis etiquetas se mapearon a nombres en español.
- Se eliminaron duplicados según la normalización usada por el programa:
  minúsculas, puntuación y espacios. Etiquetas contradictorias provocan un error.
- Quedaron 3146 textos; se eliminaron 2854 repeticiones.
- Los archivos de preparación y los originales se eliminaron a petición del usuario.

Se descartó la separación original train/validation/test al reunir los archivos.
El script actual de entrenamiento hará una nueva división. Por ello no comparar
sus métricas con resultados de evaluación sobre las particiones originales.

LIMITACIÓN: solo hay dos plantillas de redacción por categoría. Eliminar duplicados
no elimina variantes de una misma plantilla. Una división aleatoria puede producir
métricas muy altas sin demostrar generalización a reportes reales. Para evaluar
esa capacidad hacen falta textos independientes redactados/revisados por técnicos,
o una evaluación por familias de escenarios. No presentar resultados del prototipo
como evidencia de detección de fallas reales. Revisar humanamente la traducción.

Se entrenaron ambos modelos con este archivo para el prototipo. Ver artifacts/metricas.json; las métricas no representan validación con reportes reales.

El CSV se conserva en raw/ por decisión del equipo, aunque es una versión traducida y depurada.
SHA-256 del CSV conservado: f88f7eeedf612a04deb0befb1cc78101c9ea18eaa6a272c44293868fdc178507
