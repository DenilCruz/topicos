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
