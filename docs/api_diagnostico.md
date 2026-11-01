# Diagnóstico de un ticket

Instalar las dependencias de backend y entrenar primero desde la raíz:

```bash
python -m pip install -r backend/requirements.txt
python -m src.models.entrenar --datos data/raw/incidentes.csv
```

Enviar `POST /api/v1/nlp/diagnosticar/` con autenticación JWT
(`Authorization: Bearer TOKEN`) y cuerpo `{"ticket_id": 12}`.

Se consulta la descripción almacenada, se ejecuta el pipeline y se guardan
categoría, probabilidad, tiempo de inferencia y fecha de actualización.
El estado pasa de PENDIENTE_DIAGNOSTICO a DIAGNOSTICADO. Se conserva la prioridad.
El usuario autenticado tiene el mismo acceso general que en la API actual de tickets.

Respuesta 200: `{"success": true, "data": {"ticket_id": 12,
"categoria_predecida": "DNS", "probabilidad": 0.92, "tiempo_inferencia_ms": 15,
"estado": "DIAGNOSTICADO", "prioridad": null}}`.
Estos valores son ilustrativos, no resultados medidos.

Errores: 400 entrada/estado/descripción inválidos, 404 ticket inexistente,
409 ticket modificado durante inferencia y 503 modelo ausente o incompatible.
Los errores usan el formato común de la API. Un fallo de inferencia no actualiza el ticket.
La operación reutiliza la auditoría existente; no dispara procesos Bonita.

El pipeline se carga al primer uso y se conserva en memoria. Reiniciar Django
después de reemplazarlo. `NLP_PIPELINE_PATH` se configura en settings/base.py.
Solo cargar artefactos joblib confiables generados por el proyecto.
No se requieren nuevas migraciones.

## Consulta desde la pantalla NLP

`POST /api/v1/nlp/predecir/` recibe `{"texto": "El servidor DNS no responde"}`.
Requiere JWT y entre 10 y 2000 caracteres. Devuelve categoría, probabilidad,
tiempo de inferencia y `preprocesamiento`: normalización, tokens, stop words
eliminadas, raíces/lemas, n-gramas y hasta 30 pesos TF-IDF no nulos.
Usa el pipeline ajustado sin volver a entrenarlo. No modifica tickets.
La pantalla NLP consume este endpoint; analyze/ conserva el contrato anterior.
Si falta el modelo muestra el error 503. Hace falta entrenar con el dataset real
para comprobar la experiencia completa con resultados definitivos.

## Métricas del entrenamiento

`GET /api/v1/nlp/metricas/` requiere `Authorization: Bearer TOKEN`.
Lee `artifacts/metricas.json`, configurable con `NLP_METRICAS_PATH`.
Responde 200 con `success: true` y `data`:

- `modelo_elegido`, `criterio`, `semilla` y `distribucion`.
- `cantidad_entrenamiento` y `cantidad_prueba`.
- `modelos`: para cada clasificador, F1 de validación, mejores parámetros,
  experimentos y evaluación de prueba (reporte por categoría, matriz y errores).
- `advertencia`: limitaciones de la evaluación sintética.

Si falta el archivo o tiene formato inválido, devuelve 503 con el formato de error
común de la API. No incluye índices de registros ni reentrena modelos. Las métricas
corresponden al informe guardado. `revision_adicional` devuelve por separado
accuracy, reporte, categorías, matriz, casos y origen del análisis adicional.
Es null si falta ese informe, está dañado o su hash no coincide con el pipeline
guardado. El frontend distingue ambas muestras y solo compara los dos modelos
en el test de plantillas. La revisión adicional corresponde al pipeline ganador.

## Estado del módulo NLP

`GET /api/v1/nlp/estado/` requiere el mismo JWT. Respuesta lista (200):

```json
{"success": true, "data": {"servicio_activo": true, "pipeline_disponible": true, "estado": "listo"}}
```

Comprueba que el pipeline pueda cargarse y ejecutar una predicción de comprobación.
Si falla, responde 503 con `success: false`, `servicio_activo: true`,
`pipeline_disponible: false` y `estado: "modelo_no_disponible"`.
No comprueba Supabase ni Bonita. Reutiliza el modelo cargado en memoria;
reiniciar el backend después de reemplazarlo. Consultas sin JWT reciben 401.
