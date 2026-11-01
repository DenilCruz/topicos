"""
Base settings for the Django modular architecture project.
"""
from pathlib import Path
from datetime import timedelta
import os
import urllib.parse as urlparse

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Cargar variables de entorno desde .env
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / '.env')
    load_dotenv(BASE_DIR.parent / '.env')
except ImportError:
    pass

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'insecure-development-secret-key-change-me')

ALLOWED_HOSTS = ['*']

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

# Business packages / modules
BUSINESS_MODULES = [
    'modules.autenticacion.apps.AutenticacionConfig',
    'modules.bonita.apps.BonitaConfig',
    'modules.nlp.apps.NlpConfig',
    'modules.logs.apps.LogsConfig',
    'modules.tickets.apps.TicketsConfig',
    'modules.reports.apps.ReportsConfig',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + BUSINESS_MODULES

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # Middleware del módulo de logs para auditoría de peticiones
    'modules.logs.middleware.audit_middleware.AuditLogMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'core.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 20,
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
}

# Simple JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Database configuration (Supabase PostgreSQL / SQLite fallback)
DATABASE_URL = os.environ.get('DATABASE_URL')
DB_HOST = os.environ.get('DB_HOST')

if DATABASE_URL and not any(placeholder in DATABASE_URL for placeholder in ['[TU-PROJECT-REF]', '[TU-PASSWORD]']):
    url = urlparse.urlparse(DATABASE_URL)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': url.path[1:] if url.path else 'postgres',
            'USER': urlparse.unquote(url.username or 'postgres'),
            'PASSWORD': urlparse.unquote(url.password or ''),
            'HOST': url.hostname or '',
            'PORT': url.port or 5432,
            'OPTIONS': {
                'sslmode': os.environ.get('DB_SSLMODE', 'require'),
            },
        }
    }
elif DB_HOST and '[TU-PROJECT-REF]' not in DB_HOST:
    DATABASES = {
        'default': {
            'ENGINE': os.environ.get('DB_ENGINE', 'django.db.backends.postgresql'),
            'NAME': os.environ.get('DB_NAME', 'postgres'),
            'USER': os.environ.get('DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': DB_HOST,
            'PORT': os.environ.get('DB_PORT', '5432'),
            'OPTIONS': {
                'sslmode': os.environ.get('DB_SSLMODE', 'require'),
            },
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Reutiliza la conexión a PostgreSQL entre peticiones: abrir una conexión TLS nueva
# hacia Supabase en cada request añade ~1-2 s de latencia
if DATABASES['default']['ENGINE'].endswith('postgresql'):
    DATABASES['default']['CONN_MAX_AGE'] = int(os.environ.get('DB_CONN_MAX_AGE', '60'))
    DATABASES['default']['CONN_HEALTH_CHECKS'] = True

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = True
