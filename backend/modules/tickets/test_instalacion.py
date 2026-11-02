"""Verifica el aprovisionamiento desde una base vacía, sin servicios externos."""
from io import StringIO
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.db import connection
from django.test import TransactionTestCase
from rest_framework.test import APIClient
from modules.autenticacion.domain.models import AuditLog, UserProfile
from modules.tickets.domain.models import Dispositivo, Ticket, Usuario


class PruebaInstalacion(TransactionTestCase):
    def test_crear_repetir_y_usar_base_nueva(self):
        with self.assertRaises(CommandError):
            call_command('preparar_base', comprobar=True, stdout=StringIO())
        # Una tabla incompatible debe conservarse intacta y detener el comando.
        with connection.cursor() as cursor:
            cursor.execute('CREATE TABLE usuarios (id integer PRIMARY KEY)')
        try:
            with self.assertRaises(CommandError):
                call_command('preparar_base', stdout=StringIO())
            self.assertNotIn('dispositivos', connection.introspection.table_names())
            with connection.cursor() as cursor:
                columnas = connection.introspection.get_table_description(cursor, 'usuarios')
            self.assertEqual([c.name for c in columnas], ['id'])
        finally:
            with connection.cursor() as cursor:
                cursor.execute('DROP TABLE usuarios')
        call_command('preparar_base', stdout=StringIO())
        try:
            dispositivo = Dispositivo.objects.create(nombre='Dispositivo de prueba')
            call_command('preparar_base', stdout=StringIO())
            call_command('preparar_base', comprobar=True, stdout=StringIO())
            self.assertEqual(Dispositivo.objects.count(), 1)
            usuario = get_user_model().objects.create_user(username='instalacion', password='solo-para-prueba', is_staff=True)
            UserProfile.objects.create(user=usuario, role='ADMIN')
            cliente = APIClient()
            login = cliente.post('/api/v1/auth/login/', {'username': usuario.username, 'password': 'solo-para-prueba'}, format='json')
            self.assertEqual(login.status_code, 200)
            cliente.credentials(HTTP_AUTHORIZATION='Bearer ' + login.json()['token'])
            respuesta = cliente.post('/api/v1/tickets', {
                'titulo': 'Comprobar instalación', 'descripcion': 'El equipo no obtiene una dirección IP.',
                'dispositivoId': dispositivo.pk,
            }, format='json')
            self.assertEqual(respuesta.status_code, 201)
            self.assertEqual(Ticket.objects.get().estado, 'PENDIENTE_DIAGNOSTICO')
            self.assertEqual(Usuario.objects.get().username, usuario.username)
            AuditLog.objects.create(usuario=usuario.username, metodo_accion='prueba_instalacion')
            self.assertEqual(AuditLog.objects.count(), 1)
            self.assertEqual(cliente.get('/api/v1/reports/metrics').status_code, 200)
            self.assertEqual(cliente.get('/api/v1/logs/').status_code, 200)
        finally:
            # El runner no elimina automáticamente tablas con managed=False.
            with connection.schema_editor() as editor:
                for modelo in [Ticket, Dispositivo, Usuario, AuditLog]:
                    editor.delete_model(modelo)
