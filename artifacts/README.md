# Resultados del prototipo

Entrenamiento ejecutado sobre data/raw/incidentes_es.csv (3146 textos sintéticos
traducidos), con 2516 ejemplos de entrenamiento y 630 de prueba.

pipeline.joblib contiene el pipeline elegido. metricas.json conserva los resultados,
parámetros, versiones, experimentos y separación de datos.

Ambos modelos obtuvieron F1 macro 1.0 en validación y prueba. Se eligió regresión
logística por la regla de desempate del programa, no por superioridad medida.
Ganó la configuración stemming y unigramas; esto no demuestra que sea la mejor
para textos reales. Solo hay dos plantillas originales por categoría, cuyas
variantes aparecen en las particiones. Hace falta evaluación independiente para
medir generalización. Estos resultados son del prototipo sintético.

Reiniciar el backend si estaba abierto antes de generar o reemplazar el modelo.
