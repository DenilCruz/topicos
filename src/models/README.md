# Entrenamiento y evaluación

Cada clasificador se construye en su archivo: RegresionLogistica.py y NaiveBayes.py.
configuracion.py define semilla, particiones e hiperparámetros.
entrenamiento.py conecta cada modelo con NLP y ejecuta validación cruzada.
evaluacion.py calcula métricas y lista errores para su posterior interpretación.
entrenar.py carga datos, separa entrenamiento/prueba y guarda el resultado.

Desde la raíz:

```bash
python -m src.models.entrenar --datos data/raw/incidentes.csv
```

El CSV necesita columnas texto y categoria. Se rechazan vacíos y textos duplicados
tras normalización. Revisar manualmente también casos casi duplicados.
Se reserva 20% para prueba, con semilla 42 y estratificación. Cada categoría necesita
al menos tres ejemplos en entrenamiento para los tres folds de validación.

Se comparan stemming/lematización, unigramas/unigramas+bigrams y parámetros de ambos
clasificadores. Regresión logística compara pesos balanceados frente a pesos uniformes.
Revisar desbalance y recall por clase al interpretar los resultados de Naive Bayes.
El ganador se elige por F1 macro de validación; nunca por las métricas de prueba.
Los empates mantienen el primer modelo (regresión logística).

Requiere requirements-nlp.txt y el modelo es_core_news_sm para lematización.
Para una comprobación provisional sin el modelo de idioma usar --metodos stemming;
esa ejecución NO completa la comparación morfológica exigida por la materia.

artifacts/pipeline.joblib contiene el pipeline ganador ajustado sobre entrenamiento.
artifacts/metricas.json incluye parámetros, experimentos, métricas finales, errores,
versiones, hash del CSV e índices de separación (índices de registros desde cero).
Repetir el entrenamiento sobrescribe ambos archivos en la carpeta de salida.
Usar --salida para conservar experimentos en otra carpeta.

El dataset real sigue pendiente. Las pruebas usan ejemplos sintéticos temporales y
sus resultados no representan la calidad real del modelo. Para la defensa se debe
interpretar manualmente por qué fallan los ejemplos incluidos en errores.
