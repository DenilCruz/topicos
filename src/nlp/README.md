# Pipeline en español

Los archivos siguen las etapas de clase:

- `Normalizacion.py`: limpieza del texto.
- `Tokenizacion.py`: separación en tokens.
- `Stopwords.py`: lista española y eliminación de palabras vacías.
- `StemmingLematizacion.py`: reducción a raíces o lemas.
- `N_gramas.py`: generación de secuencias y matriz de conteos.
- `TF_IDF.py`: cálculo de pesos a partir de los conteos.
- `pipeline.py`: coordinación de las etapas anteriores.

Los guiones bajos permiten importar los módulos con la sintaxis normal de Python.
Separar CountVectorizer y TfidfTransformer conserva el cálculo que antes hacía
TfidfVectorizer. Vocabulario y frecuencias mínima/máxima se configuran en la etapa
de n-gramas. En búsquedas de hiperparámetros usar `ngramas__ngram_range`.

Instalar desde la raíz con `python -m pip install -r requirements-nlp.txt`.
Para lematización instalar también `python -m spacy download es_core_news_sm`.
Registrar la versión del modelo de idioma utilizado en los experimentos.

Importar `crear_pipeline_nlp` y `explicar_preprocesamiento` desde `src.nlp.pipeline`.
Elegir metodo="stemming" o metodo="lematizacion" y rango_ngramas=(1, 1) o (1, 2).
El pipeline se crea sin entrenar. Unirlo al clasificador antes de validación cruzada
para que TF-IDF aprenda solamente del entrenamiento de cada partición.

La normalización conserva tildes y números, sustituye URLs por enlaceweb y elimina
puntuación y emojis. IPs y términos como Wi-Fi se separan en varios tokens.
La lista española de spaCy conserva no, ni, nunca, sin y tampoco.
La lematización analiza la oración completa antes de retirar stop words.
La función de explicación utiliza los mismos pasos que la transformación.

El backend todavía no utiliza este pipeline. El entrenamiento y la integración
se implementarán por separado.
