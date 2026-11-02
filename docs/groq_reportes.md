# Groq como alternativa a DeepSeek

En Reportes > Análisis por Voz (IA), elegir Groq o DeepSeek. La selección se aplica
a las consultas transcritas y al botón Resumen semanal. Las peticiones sin proveedor
conservan DeepSeek como opción predeterminada del backend.

Configurar en backend/.env (no subir a Git):

```dotenv
GROQ_API_KEY=colocar_clave_local
GROQ_MODEL=openai/gpt-oss-120b
GROQ_TIMEOUT_SECONDS=30
```

Reiniciar Django después de cambiar variables de entorno. DeepSeek conserva sus
variables DEEPSEEK_API_KEY, DEEPSEEK_MODEL y demás configuración existente.

POST /api/v1/reports/voice acepta texto, dias y proveedor (groq o deepseek).
GET /api/v1/reports/executive acepta dias y proveedor como parámetros de consulta.
La respuesta de voz incluye proveedor y modelo. No hay cambio automático entre
proveedores cuando falla una consulta: se muestra el error y se puede elegir otro.

El reconocimiento de voz y la lectura siguen a cargo del navegador. Groq genera
el texto del reporte a partir de la transcripción y las métricas calculadas por
el backend. No sustituye los clasificadores NLP ni recibe credenciales de Supabase.

Referencia: https://console.groq.com/docs/openai
Modelos: https://console.groq.com/docs/models
