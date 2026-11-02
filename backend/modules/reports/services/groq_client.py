"""Proveedor alternativo de reportes, sin acceso directo a la base de datos."""
import os
import requests
from core.exceptions import DomainException


class GroqClient:
    def __init__(self):
        self.api_key = os.environ.get('GROQ_API_KEY', '')
        self.model = os.environ.get('GROQ_MODEL', 'openai/gpt-oss-120b')
        self.timeout = int(os.environ.get('GROQ_TIMEOUT_SECONDS', '30'))

    def completar(self, system_prompt, user_message):
        if not self.api_key:
            raise DomainException('GROQ_API_KEY no está configurada en el backend.', code='LLM_NOT_CONFIGURED')
        try:
            respuesta = requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={'Authorization': f'Bearer {self.api_key}'},
                json={'model': self.model, 'temperature': 0.2,
                      'messages': [{'role': 'system', 'content': system_prompt},
                                   {'role': 'user', 'content': user_message}]},
                timeout=self.timeout,
            )
        except requests.Timeout as error:
            raise DomainException('Groq no respondió a tiempo.', code='LLM_TIMEOUT') from error
        except requests.RequestException as error:
            raise DomainException('No se pudo conectar con Groq.', code='LLM_CONNECTION_ERROR') from error
        if respuesta.status_code != 200:
            mensajes = {401: 'La clave de Groq no es válida.', 429: 'Groq alcanzó su límite de uso. Intenta más tarde.',
                        403: 'La cuenta no tiene acceso al modelo de Groq configurado.',
                        404: 'El modelo de Groq configurado no está disponible.'}
            raise DomainException(mensajes.get(respuesta.status_code, 'Groq no pudo generar el reporte.'), code='LLM_REQUEST_FAILED')
        try:
            contenido = respuesta.json()['choices'][0]['message']['content']
            if not isinstance(contenido, str) or not contenido.strip():
                raise ValueError('Contenido vacío.')
            return contenido.strip()
        except (ValueError, KeyError, IndexError, TypeError) as error:
            raise DomainException('Groq devolvió una respuesta inválida.', code='LLM_BAD_RESPONSE') from error

    def generar_resumen(self, metricas):
        import json
        from .report_service import SYSTEM_PROMPT
        return self.completar(SYSTEM_PROMPT.format(datos_json=json.dumps(metricas, ensure_ascii=False)),
                              'Genera el resumen ejecutivo.')
