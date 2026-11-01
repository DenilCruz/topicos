# Notebook de análisis

Abrir 01_exploracion_y_experimentos.ipynb en VS Code con las extensiones Python y
Jupyter. Instalar dependencias desde la raíz: python -m pip install -r requirements-analisis.txt.
Seleccionar ese entorno Python y ejecutar todas las celdas en orden.

El notebook ya incluye resultados y gráficos ejecutados. Lee data/raw/incidentes_es.csv
y artifacts/metricas.json; comprueba que el hash del CSV coincida con las métricas.
No vuelve a entrenar los modelos ni modifica el dataset.

Incluye calidad de datos, distribución, longitudes, palabras frecuentes, plantillas,
comparación de experimentos, métricas por clase, matrices de confusión y limitaciones.
