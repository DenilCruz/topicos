"""Recorrido real por la API y PostgreSQL, con datos de prueba reversibles.

Ejecutar desde la raíz: python tests/prueba_integracion.py
Usa el .env del backend. Revierte las filas al terminar; las secuencias de
PostgreSQL pueden avanzar. No imprime contraseñas, tokens ni cadenas de conexión.
"""
import json
import argparse
import os
from pathlib import Path
import secrets
import sys
from datetime import datetime, timezone

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

import django
django.setup()

from django.contrib.auth.models import User
from django.db import connection, transaction
from django.conf import settings
from rest_framework.test import APIClient
from modules.autenticacion.domain.models import UserProfile
from modules.tickets.domain.models import Ticket, Dispositivo
from modules.logs.domain.models import AuditLog


def ejecutar_prueba():
    resultados = []
    cliente = APIClient()

    def comprobar(nombre, metodo, ruta, esperado, datos=None, verificar=None):
        respuesta = getattr(cliente, metodo)(ruta, datos, format='json') if datos is not None else getattr(cliente, metodo)(ruta)
        cuerpo = respuesta.json()
        correcto = respuesta.status_code == esperado
        if correcto and verificar:
            correcto = bool(verificar(cuerpo))
        resultados.append({'caso': nombre, 'http': respuesta.status_code,
                           'esperado': esperado, 'correcto': correcto})
        if not correcto:
            raise AssertionError(f'{nombre}: HTTP {respuesta.status_code}, esperado {esperado}')
        return cuerpo

    antes = Ticket.objects.count()
    with transaction.atomic():
        usuario = 'prueba_' + secrets.token_hex(5)
        clave = secrets.token_urlsafe(24)
        administrador = User.objects.create_user(username=usuario, password=clave, is_staff=True)
        UserProfile.objects.update_or_create(user=administrador, defaults={'role': 'ADMIN'})
        dispositivo = Dispositivo.objects.order_by('id').first()
        if dispositivo is None:
            raise AssertionError('Falta un dispositivo registrado para ejecutar el recorrido.')

        comprobar('NLP sin autenticación', 'get', '/api/v1/nlp/estado/', 401)
        comprobar('Contraseña incorrecta', 'post', '/api/v1/auth/login/', 401,
                  {'username': usuario, 'password': 'incorrecta'})
        acceso = comprobar('Inicio de sesión JWT', 'post', '/api/v1/auth/login/', 200,
                           {'username': usuario, 'password': clave})
        cliente.credentials(HTTP_AUTHORIZATION='Bearer ' + acceso['token'])
        comprobar('Identidad del usuario', 'get', '/api/v1/auth/me/', 200)
        comprobar('Pipeline disponible', 'get', '/api/v1/nlp/estado/', 200,
                  verificar=lambda c: c['data']['pipeline_disponible'])
        comprobar('Comparación de modelos disponible', 'get', '/api/v1/nlp/metricas/', 200)
        comprobar('Descripción vacía rechazada', 'post', '/api/v1/nlp/predecir/', 400, {'texto': ''})
        comprobar('Descripción extensa rechazada', 'post', '/api/v1/nlp/predecir/', 400, {'texto': 'a' * 2001})
        comprobar('JSON con campo incorrecto rechazado', 'post', '/api/v1/nlp/predecir/', 400, {'otro': 'prueba'})
        texto = 'El dispositivo no obtiene una dirección IP del servidor DHCP y no puede conectarse a la red.'
        prediccion = comprobar('Inferencia y preprocesamiento reales', 'post', '/api/v1/nlp/predecir/', 200,
                               {'texto': texto}, verificar=lambda c: bool(c['data']['preprocesamiento']))
        comprobar('Catálogo de dispositivos', 'get', '/api/v1/dispositivos/', 200)
        creado = comprobar('Registro de ticket pendiente', 'post', '/api/v1/tickets', 201,
                           {'titulo': 'Prueba de integración NLP', 'descripcion': texto, 'dispositivoId': dispositivo.pk},
                           verificar=lambda c: c['data']['estado'] == 'PENDIENTE_DIAGNOSTICO')
        ticket_id = creado['data']['id']
        comprobar('Diagnóstico del ticket', 'post', '/api/v1/nlp/diagnosticar/', 200, {'ticket_id': ticket_id})
        guardado = Ticket.objects.get(pk=ticket_id)
        persistencia = (guardado.estado == 'DIAGNOSTICADO' and
                        guardado.categoria_predecida == prediccion['data']['categoria_predecida'] and
                        guardado.probabilidad is not None and guardado.tiempo_inferencia_ms is not None)
        resultados.append({'caso': 'Diagnóstico comprobado en PostgreSQL', 'correcto': persistencia})
        assert persistencia
        comprobar('Segundo diagnóstico rechazado', 'post', '/api/v1/nlp/diagnosticar/', 400, {'ticket_id': ticket_id})
        comprobar('Consulta filtrada de tickets', 'get', '/api/v1/tickets?estado=DIAGNOSTICADO', 200,
                  verificar=lambda c: any(f['id'] == ticket_id for f in c['content']))
        comprobar('Métricas calculadas con la base de datos', 'get', '/api/v1/reports/metrics?dias=7', 200,
                  verificar=lambda c: c['metrics']['tickets_con_diagnostico'] >= 1)
        comprobar('Opciones de filtros', 'get', '/api/v1/reports/opciones', 200)
        comprobar('Ventana inválida rechazada', 'get', '/api/v1/reports/metrics?dias=0', 400)
        comprobar('Consulta manual vacía rechazada', 'post', '/api/v1/reports/voice', 400, {'texto': '', 'proveedor': 'groq'})
        comprobar('Consulta de auditoría como administrador', 'get', '/api/v1/logs/', 200)
        registros = AuditLog.objects.filter(path='/api/v1/nlp/diagnosticar/').exists()
        resultados.append({'caso': 'Middleware registró el diagnóstico', 'correcto': registros})
        assert registros
        transaction.set_rollback(True)

    assert Ticket.objects.count() == antes
    resultados.append({'caso': 'Filas de prueba revertidas', 'correcto': True})
    informe = {'fecha_utc': datetime.now(timezone.utc).isoformat(), 'motor_bd': connection.vendor,
               'puerto_bd': settings.DATABASES['default']['PORT'],
               'alcance': 'Cliente Django con middleware, JWT, pipeline real y base configurada. Sin navegador ni micrófono.',
               'ticket_prueba': ticket_id, 'categoria_obtenida': guardado.categoria_predecida,
               'casos': resultados, 'todos_correctos': all(c['correcto'] for c in resultados)}
    destino = RAIZ / 'docs' / 'evidencias' / 'integracion.json'
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps(informe, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'{len(resultados)} verificaciones correctas. Evidencia: {destino}')


if __name__ == '__main__':
    argumentos = argparse.ArgumentParser(description=__doc__)
    argumentos.add_argument('--puerto-bd', help='Puerto alternativo de Supabase solo para esta ejecución.')
    opciones = argumentos.parse_args()
    if opciones.puerto_bd:
        settings.DATABASES['default']['PORT'] = opciones.puerto_bd
    ejecutar_prueba()
