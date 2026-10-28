# Arquitectura Modular: Django & React

Este repositorio contiene la arquitectura modular y desacoplada respetando los principios **SOLID**, organizada en paquetes de negocio independientes tanto en el backend como en el frontend.

---

## 📁 Módulos de Negocio

1. **`autenticacion`**: Gestión de usuarios, sesiones JWT, perfiles, roles y control de acceso (RBAC).
2. **`bonita`**: Integración con el motor Bonita BPM (orquestación de casos, procesos y tareas humanas).
3. **`nlp`**: Procesamiento de Lenguaje Natural (análisis de sentimiento, resumen automático y extracción de entidades), extensible mediante el protocolo `INlpEngine`.
4. **`logs`**: Middleware de auditoría y trazabilidad en tiempo real de peticiones HTTP, estado y tiempos de respuesta.

---

## 🏛️ Estructura del Proyecto

```text
codigo/
├── backend/                       # Backend en Django / DRF
│   ├── config/                    # Configuración central (settings divididos, urls, wsgi/asgi)
│   ├── core/                      # Kernel compartido (excepciones, paginación, permisos)
│   ├── modules/                   # Paquetes de negocio
│   │   ├── autenticacion/         # api / domain / repositories / services
│   │   ├── bonita/                # api / domain / infrastructure / services
│   │   ├── nlp/                   # api / domain / adapters / services
│   │   └── logs/                  # api / domain / middleware / repositories / services
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/                      # Frontend en React + TypeScript + Vite
    ├── src/
    │   ├── config/                # Variables de entorno
    │   ├── shared/                # HTTP client (Axios), componentes y hooks comunes
    │   ├── modules/               # Paquetes de negocio
    │   │   ├── autenticacion/     # components / context / hooks / services / types
    │   │   ├── bonita/            # components / hooks / services / types
    │   │   ├── nlp/               # components / hooks / services / types
    │   │   └── logs/              # components / hooks / services / types
    │   ├── routes/                # Enrutador con ProtectedRoute por roles
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

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
