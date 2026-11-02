"""Provisiona las tablas de negocio que no administran las migraciones."""
from django.core.management.base import BaseCommand, CommandError
from django.db import connections
from modules.autenticacion.domain.models import AuditLog
from modules.tickets.domain.models import Dispositivo, Ticket, Usuario


class Command(BaseCommand):
    help = 'Crea tablas de negocio faltantes y comprueba sus columnas, sin alterar tablas existentes.'

    def add_arguments(self, parser):
        parser.add_argument('--comprobar', action='store_true', help='Solo comprueba, sin crear tablas.')
        parser.add_argument('--database', default='default', help='Alias de la conexión configurada.')

    def handle(self, *args, **opciones):
        conexion = connections[opciones['database']]
        modelos = [Usuario, Dispositivo, Ticket, AuditLog]
        existentes = set(conexion.introspection.table_names())
        problemas = []
        # Validar antes de crear: una tabla incompatible debe revisarse manualmente.
        with conexion.cursor() as cursor:
            for modelo in modelos:
                tabla = modelo._meta.db_table
                if tabla not in existentes:
                    if opciones['comprobar']:
                        problemas.append(f'Falta la tabla {tabla}.')
                    continue
                columnas = {c.name for c in conexion.introspection.get_table_description(cursor, tabla)}
                faltantes = {c.column for c in modelo._meta.local_fields} - columnas
                if faltantes:
                    problemas.append(f'{tabla}: faltan columnas {", ".join(sorted(faltantes))}.')
        if problemas:
            raise CommandError('\n'.join(problemas))

        if not opciones['comprobar']:
            # Se invoca explícitamente el editor porque estos modelos usan managed=False.
            # Respeta el motor configurado y crea primero las tablas referenciadas.
            with conexion.schema_editor() as editor:
                for modelo in modelos:
                    tabla = modelo._meta.db_table
                    if tabla not in existentes:
                        editor.create_model(modelo)
                        self.stdout.write(f'Tabla creada: {tabla}')
        self.stdout.write(self.style.SUCCESS('Tablas de negocio y columnas esperadas disponibles.'))
        self.stdout.write('La comprobación no certifica tipos, índices ni restricciones de tablas preexistentes.')
