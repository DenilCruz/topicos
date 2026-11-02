# Mi Red

Aplicación web para registrar incidentes de red, clasificar sus descripciones con NLP y consultar reportes y auditoría. Proyecto de Tópicos y Programación Avanzada.

El backend usa Django REST Framework y PostgreSQL/Supabase. El frontend usa React, TypeScript y Vite. El clasificador utiliza scikit-learn, NLTK y spaCy. Groq y DeepSeek son proveedores alternativos para redactar reportes; no sustituyen los modelos de clasificación entrenados por el grupo.

## Funcionalidades actuales

- Autenticación JWT y perfiles de usuario.
- Registro y consulta paginada de tickets, catálogo de dispositivos y filtros.
- Clasificación de texto con probabilidad, tiempo de inferencia y desglose del preprocesamiento.
- Comparación de regresión logística y Naive Bayes, métricas por categoría y matrices de confusión.
- Diagnóstico de tickets mediante API: guarda categoría, probabilidad y tiempo, y cambia el estado pendiente a diagnosticado. La pantalla de consulta NLP no modifica tickets; todavía no hay un botón de diagnóstico en la tabla de Tickets.
- Reportes estáticos con exportación CSV y PDF mediante la impresión del navegador; dashboard de métricas de tickets.
- Reportes de IA por voz o texto, seleccionando Groq o DeepSeek. Reconocimiento y lectura de voz mediante el navegador.
- Consulta de logs HTTP con búsqueda, filtros, paginación y exportación de la página visible.

La integración Bonita permanece en el código, pero está retirada del menú y no forma parte del recorrido actual. El sistema no descubre ni monitorea automáticamente dispositivos, no inspecciona redes de Packet Tracer ni confirma físicamente la causa de una falla.

## Estructura

```text
codigo/
├── artifacts/             # Pipeline entrenado y resultados de evaluación
├── backend/               # Django: configuración, API y módulos de negocio
├── data/
│   ├── raw/               # CSV de entrenamiento traducido y depurado
│   ├── processed/         # Reservado para datos derivados
│   └── evaluacion/        # Casos adicionales, separados del entrenamiento
├── docs/                  # Informe, diapositivas y prueba completa
├── frontend/              # React: módulos, hooks, servicios y estilos
├── notebooks/             # Análisis exploratorio y experimentos ejecutados
├── src/
│   ├── nlp/               # Etapas de NLP y explicación del pipeline
│   └── models/            # Clasificadores, entrenamiento y evaluación
├── tests/                 # Pruebas de NLP y entrenamiento
├── requirements-nlp.txt
├── requirements-analisis.txt
└── CONTRIBUCIONES.md
```

## Requisitos

Entorno usado en el desarrollo: Python 3.13 en Windows, Node.js 22 y pnpm 10.34.7. Se necesita acceso a PostgreSQL para el entorno compartido. Para capturar voz se requiere un navegador compatible, permiso de micrófono y conexión al servicio de reconocimiento del navegador; la consulta escrita es una alternativa.

`requirements-lock.txt` fija las dependencias Python directas y transitivas del entorno Windows/Python 3.13. Los requisitos de backend y NLP utilizan ese archivo como restricciones, y el modelo español de spaCy está fijado en 3.8.0 con URL y SHA-256. Para instalar también las herramientas del notebook: `python -m pip install -r requirements-analisis.txt`. El frontend conserva sus versiones exactas en `frontend/pnpm-lock.yaml`; instalar con `--frozen-lockfile`. Este entorno fijado no se presenta como validado en Linux o en otra versión de Python.

## Instalación del backend (PowerShell)

Desde la raíz del repositorio:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
```

Copiar la plantilla solo si `backend/.env` todavía no existe; no reemplazar una configuración válida. Editar el archivo local con las credenciales del entorno:

- `DJANGO_SECRET_KEY`: secreto del backend.
- `DATABASE_URL`: conexión PostgreSQL de Supabase; alternativamente, usar los campos `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT` y `DB_SSLMODE`.
- `GROQ_API_KEY` y `GROQ_MODEL`, o las variables `DEEPSEEK_*`, si se utilizarán reportes con IA.

Django carga primero `backend/.env` y luego el `.env` de la raíz sin reemplazar variables ya definidas. No publicar estos archivos ni claves reales. El frontend utiliza la API Django; no necesita la clave de servicio de Supabase.

### Reproducir la base de datos desde cero

En una instancia nueva de PostgreSQL/Supabase, usar una base vacía y una cuenta con permisos para crear tablas. En Supabase, abrir **Connect** y copiar los parámetros de conexión que muestra el proyecto: host, puerto, base, usuario y contraseña de PostgreSQL. No son las claves anon/service_role de su API.

Editar `backend/.env` usando una sola opción:

- `DATABASE_URL`: pegar la cadena del proyecto y sustituir la contraseña. Si contiene caracteres especiales, codificarlos para URL. Esta opción tiene prioridad sobre los campos separados.
- Campos separados: dejar `DATABASE_URL` vacío y completar `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `DB_SSLMODE=require`. Copiar el usuario completo que muestra Supabase, incluido el identificador del proyecto cuando se usa el pooler. Los campos separados evitan codificar la contraseña como URL.

Para PostgreSQL local se pueden usar esos mismos campos con `DB_HOST=127.0.0.1` y `DB_SSLMODE=disable`; crear primero la base y su usuario en PostgreSQL. No cambiar el `.env` de un entorno compartido para probar una instalación nueva.

Con el entorno virtual activo, desde la raíz:

```powershell
python backend/manage.py migrate
python backend/manage.py preparar_base
python backend/manage.py preparar_base --comprobar
```

`migrate` crea las tablas administradas por Django: autenticación, perfiles, sesiones y logs HTTP. `preparar_base` crea las cuatro tablas de negocio con `managed=False`: `usuarios`, `dispositivos`, `tickets` y `audit_logs`. Usa los modelos actuales y el editor de esquema del motor configurado, por lo que incluye las relaciones de tickets con usuario y dispositivo. No necesita SQL pegado manualmente ni datos del entorno original.

El comando puede repetirse: conserva tablas y filas existentes y solo crea tablas faltantes. Antes de crear comprueba que las tablas existentes tengan las columnas esperadas; si faltan columnas se detiene y pide corregir el esquema por separado. `--comprobar` no crea ni altera tablas. Esta comprobación verifica nombres de tablas y columnas, no certifica los tipos, índices ni restricciones de una base previamente creada.

`audit_logs` almacena auditoría de operaciones y diagnósticos. Es distinta de `logs_auditlog`, creada por migraciones para las peticiones HTTP y mostrada en Logs. No ejecutar `makemigrations` para la instalación ni usar `--fake` para ocultar conflictos de esquema.

Si aparece `EMAXCONNSESSION`, el pool de sesiones está lleno. Usar los parámetros del pooler de transacciones que muestra Supabase (normalmente puerto 6543) o liberar las sesiones del entorno. Puede configurarse `DB_CONN_MAX_AGE=0` para cerrar la conexión al terminar cada petición. No cambiar únicamente el puerto si el proyecto muestra otro host o usuario para esa modalidad.

### Registrar el primer dispositivo

El aprovisionamiento deja las tablas vacías: no copia tickets, usuarios ni dispositivos de otras personas. Desde la raíz:

```powershell
python backend/manage.py shell
```

```python
from modules.tickets.domain.models import Dispositivo
nombre = input("Nombre de tu dispositivo: ").strip()
if nombre:
    Dispositivo.objects.create(nombre=nombre, tipo=input("Tipo: ").strip(), ubicacion=input("Ubicación: ").strip())

exit()
```

Usar un dispositivo del entorno de demostración. Es necesario al menos uno para que el formulario pueda asociar el ticket. Los usuarios de negocio se crean cuando una cuenta autenticada registra su primer ticket.

Después de crear la cuenta del siguiente apartado, iniciar el servidor desde la raíz:

```powershell
python backend/manage.py runserver
```

API: http://127.0.0.1:8000/api/v1/.

### Crear una cuenta si no existe

En otra terminal con el entorno virtual activo, desde `backend/`:

```powershell
python manage.py createsuperuser
```

Ese usuario permite autenticarse en Django. La aplicación obtiene el rol de negocio desde `UserProfile`; crear un superusuario no crea automáticamente ese perfil. Para asignar el perfil al usuario creado:

```powershell
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from modules.autenticacion.domain.models import UserProfile
usuario = get_user_model().objects.get(username="NOMBRE_DEL_USUARIO_CREADO")
UserProfile.objects.update_or_create(user=usuario, defaults={"role": "ADMIN"})
exit()
```

Las cuentas y contraseñas del entorno de desarrollo no se incluyen en la documentación.

## Frontend

En otra terminal:

```powershell
cd frontend
pnpm install --frozen-lockfile
pnpm run dev
```

Abrir http://localhost:3000 e iniciar sesión. Vite redirige `/api` al backend en el puerto 8000; `VITE_API_URL` permite configurar otra URL si se necesita. Mantener ambas terminales abiertas. Detener cada servidor con Ctrl+C.

Para comprobar la compilación:

```powershell
pnpm run build
```

## Entrenar y evaluar

Desde la raíz, con el entorno virtual activo. El modelo ganador ya está incluido en `artifacts/pipeline.joblib`; no es necesario reentrenar para iniciar la aplicación.

La instalación de `requirements-nlp.txt`, incluida por el backend, ya instala el modelo español 3.8.0. Para reproducir la comparación de stemming frente a lematización:

```powershell
python -m src.models.entrenar --datos data/raw/incidentes_es.csv
python -m src.models.analizar_errores
```

El experimento guardado usó `es_core_news_sm` 3.8.0; la versión figura en el informe de métricas. Mantener esa versión al reproducirlo. El entrenamiento compara dos clasificadores, dos métodos morfológicos, dos rangos de n-gramas e hiperparámetros mediante validación cruzada estratificada de tres particiones. Se selecciona por F1 macro de validación, con semilla 42 y 20% reservado para prueba.

Genera `artifacts/pipeline.joblib` y `artifacts/metricas.json`. El análisis adicional genera `artifacts/analisis_errores.json` sin reentrenar. Los comandos sobrescriben los resultados correspondientes; usar `--salida` en el entrenamiento para conservar otro experimento. Reiniciar el backend tras reemplazar el pipeline, porque se mantiene en memoria.

## Dataset y límites de los resultados

- 3146 textos sintéticos traducidos al español, con columnas `texto` y `categoria`.
- Fuente, preparación y limitaciones: [data/README.md](data/README.md).
- Seis etiquetas: `SENAL_DEBIL`, `FUNCIONAMIENTO_NORMAL`, `LATENCIA_ALTA`, `RIESGO_SEGURIDAD_DNS`, `CONGESTION_WIFI` y `FALLO_DHCP`.
- 2516 textos de entrenamiento y 630 de prueba. Ambos modelos obtuvieron F1 macro 1.0 y accuracy 1.0 sobre el test de plantillas. Regresión logística fue elegida por desempate, con stemming y unigramas.
- El ganador acertó 10 de 18 casos adicionales (55,6% de accuracy), redactados con asistencia de IA y pendientes de revisión técnica humana. Es una muestra pequeña distinta, no una estimación de rendimiento en producción.

La repetición de plantillas limita la evaluación. No interpretar el 100% como garantía sobre reportes reales. La probabilidad del clasificador no confirma una causa física ni determina prioridad. No incorporar los casos adicionales al entrenamiento mientras se utilicen para evaluación; si se ajusta el modelo a partir de ellos se necesita otro conjunto independiente.

## Notebook

```powershell
python -m pip install -r requirements-analisis.txt
```

Abrir `notebooks/01_exploracion_y_experimentos.ipynb` en VS Code con las extensiones Python y Jupyter. Seleccionar el entorno `.venv` y ejecutar las celdas en orden. Incluye resultados guardados, gráficos, análisis de plantillas, comparación y errores. Comprueba que las métricas correspondan al hash del CSV actual.

## API principal

Los endpoints requieren JWT. Enviar `Authorization: Bearer TOKEN` después de iniciar sesión.

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/v1/auth/login/` | Autenticar usuario y obtener tokens |
| GET / POST | `/api/v1/tickets` | Consultar o registrar tickets |
| GET | `/api/v1/dispositivos/` | Consultar dispositivos |
| POST | `/api/v1/nlp/predecir/` | Recibe `texto`; devuelve clasificación y pasos de NLP |
| POST | `/api/v1/nlp/diagnosticar/` | Recibe `ticket_id`; guarda el diagnóstico del ticket pendiente |
| GET | `/api/v1/nlp/metricas/` | Comparación y evaluación guardadas |
| GET | `/api/v1/nlp/estado/` | Estado del servicio y disponibilidad del pipeline |
| GET | `/api/v1/reports/metrics` | Métricas operativas de tickets |
| GET | `/api/v1/reports/opciones` | Estados y prioridades permitidos |
| GET | `/api/v1/reports/executive` | Resumen de métricas mediante IA |
| POST | `/api/v1/reports/voice` | Consulta transcrita o escrita; proveedor `groq` o `deepseek` |
| GET | `/api/v1/logs/` | Logs HTTP, filtros y resumen; acceso de administrador |

Documentación: [informe técnico](docs/informe_tecnico.pdf). El endpoint de estado NLP no comprueba disponibilidad de Supabase ni Bonita. No hay actualizaciones en tiempo real del avance de cada etapa: la secuencia de tarjetas presenta visualmente una respuesta que el backend ya completó.

## Pruebas

Desde la raíz:

```powershell
python -m unittest discover -s tests -p "test_*.py"
python backend/manage.py test modules.nlp modules.autenticacion.test_auditoria modules.reports.test_groq
```

Para probar el aprovisionamiento desde una base vacía, sin conectarse a Supabase:

```powershell
python backend/manage.py test modules.tickets.test_instalacion --settings=config.settings.pruebas_instalacion
```

Esta prueba usa SQLite en memoria: crea las tablas, repite el comando sin perder datos, rechaza un esquema incompatible y comprueba login, registro de ticket, reportes y logs. No sustituye la prueba de una instancia PostgreSQL recién creada.

Estas pruebas cubren preprocesamiento, entrenamiento temporal, guardado/carga, consultas NLP, auditoría y proveedor Groq. Las pruebas aisladas no demuestran por sí solas funcionamiento completo con base de datos, navegador y micrófono reales. Las pruebas adicionales de autenticación en `modules.autenticacion.tests` requieren una base de pruebas provisionada y permisos de creación; no ejecutarlas indiscriminadamente sobre la base compartida.

El [registro de integración](docs/prueba_completa.md) incluye 23 verificaciones ejecutadas contra Supabase y el guion de demostración. Para repetir el recorrido reversible desde la raíz: `python tests/prueba_integracion.py`. En esta revisión se usó `--puerto-bd 6543` porque el puerto de sesiones 5432 estaba saturado. No se modifica el `.env` y las filas temporales se revierten al terminar.

## Contribuciones y uso de IA

Ver [CONTRIBUCIONES.md](CONTRIBUCIONES.md) para los autores y commits publicados. Se utilizaron asistentes de IA en código, traducción de plantillas, casos de evaluación y documentación. Cada integrante debe revisar y poder explicar y modificar sus aportes; la asistencia de IA no sustituye la defensa individual.

## Pendientes de entrega

- Revisar con el equipo el [informe técnico](docs/informe_tecnico.pdf) y las [diapositivas](docs/presentacion_mi_red.pptx).
- Revisar traducciones y etiquetas; verificar y conservar la licencia original del dataset.
- Validar también la instalación sobre una instancia PostgreSQL nueva; el aprovisionamiento automatizado ya fue probado en una base SQLite vacía y aislada.
- Completar la verificación en navegador, exportaciones y micrófono; el diagnóstico persistido ya fue verificado por API contra Supabase.
- Revisar aportes individuales significativos en NLP/ML y evidencia de PR revisados.
- Crear y publicar la etiqueta `entrega-final` sobre la versión final evaluable.
