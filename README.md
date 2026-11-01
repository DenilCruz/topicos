# Arquitectura Modular: Django & React

Este repositorio contiene la arquitectura modular y desacoplada respetando los principios **SOLID**, organizada en paquetes de negocio independientes tanto en el backend como en el frontend.

---

## 📁 Módulos de Negocio

1. **`autenticacion`**: Gestión de usuarios, sesiones JWT, perfiles, roles y control de acceso (RBAC).
2. **`bonita`**: Integración con el motor Bonita BPM (orquestación de casos, procesos y tareas humanas).
3. **`nlp`**: Procesamiento de Lenguaje Natural (análisis de sentimiento, resumen automático y extracción de entidades), extensible mediante el protocolo `INlpEngine`.
4. **`tickets`**: Registro y consulta de incidentes y dispositivos.
5. **`reports`**: Reportes y visualizaciones.
6. **`logs`**: Middleware de auditoría y trazabilidad en tiempo real de peticiones HTTP, estado y tiempos de respuesta.

---

## 🏛️ Estructura del Proyecto

```text
codigo/
├── data/                         # Dataset y documentación de su origen
│   ├── raw/                      # Datos originales
│   └── processed/                # Datos derivados
├── notebooks/                    # Análisis exploratorio y experimentos
├── src/                          # Código compartido de NLP y ML
│   ├── nlp/                      # Pipeline de preprocesamiento
│   └── models/                   # Entrenamiento y evaluación (pendiente)
├── backend/                      # API en Django / DRF
│   ├── config/                   # Settings, rutas y configuración del servidor
│   ├── core/                     # Excepciones, paginación y permisos
│   ├── modules/
│   │   ├── autenticacion/
│   │   ├── bonita/
│   │   ├── nlp/                  # API y motor actual basado en reglas
│   │   ├── logs/
│   │   ├── tickets/
│   │   └── reports/
│   ├── manage.py
│   └── requirements.txt
├── frontend/                     # React + TypeScript + Vite
│   └── src/                      # Módulos, rutas y componentes compartidos
├── tests/                        # Pruebas de NLP/ML e integración (pendiente)
├── docs/                         # Informe técnico y diapositivas (pendiente)
├── bonita/                       # Artefactos de integración BPM
├── README.md
└── CONTRIBUCIONES.md              # Aportes verificables del equipo
```

La estructura separa datos, experimentación, código de NLP/ML y aplicación web. `backend/` cumple el papel de la carpeta `api/` sugerida en el enunciado; las pruebas Django existentes permanecen dentro de sus aplicaciones.

**Estado actual:** las carpetas académicas contienen guías para completar el proyecto. Todavía no hay dataset, notebooks de experimentación, pipeline TF-IDF entrenado ni modelos serializados. El módulo NLP del backend conserva su implementación de reglas; aún no está conectado con `src/nlp/` ni `src/models/`. Crear estas carpetas no implica que los requisitos funcionales de NLP/ML estén implementados.


---

## 🚀 Puesta en Marcha

### 1. Backend (Django)

```bash
cd backend

# Crear y activar entorno virtual
python -m venv venv
# En Windows:
.\venv\Scripts\activate
# En Linux/macOS:
# source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones iniciales
python manage.py makemigrations
python manage.py migrate

# Iniciar servidor de desarrollo en http://127.0.0.1:8000
python manage.py runserver
```

### 2. Frontend (React con pnpm)

```bash
cd frontend

# Instalar dependencias con pnpm
pnpm install

# Iniciar entorno de desarrollo en http://localhost:3000
pnpm dev
```

---

## 🔒 Cumplimiento de Principios SOLID

- **S (Single Responsibility):** Cada archivo tiene un único propósito. Las Vistas/Componentes solo gestionan presentación/transporte; los Servicios encapsulan casos de uso; los Repositorios y Clientes gestionan datos externos.
- **O (Open/Closed):** Nuevos motores de NLP o conectores de procesos se incorporan implementando interfaces sin modificar la lógica existente.
- **L (Liskov Substitution):** Cualquier clase que implemente `INlpEngine` o `IBonitaClient` es intercambiable sin alterar el comportamiento esperado.
- **I (Interface Segregation):** Contratos pequeños y especializados; los componentes visuales solo reciben las propiedades atómicas necesarias.
- **D (Dependency Inversion):** Los casos de uso dependen de abstracciones (`typing.Protocol` en backend, servicios/hooks desacoplados en frontend) y no de dependencias concretas de bajo nivel.
