from unittest.mock import patch
from django.test import SimpleTestCase
from modules.autenticacion.audit import auditable
from modules.autenticacion.domain.models import AuditLog


class PruebasAuditoria(SimpleTestCase):
    def test_modelo_mapea_columnas_existentes(self):
        self.assertFalse(AuditLog._meta.managed)
        self.assertEqual(AuditLog._meta.db_table, 'audit_logs')
        self.assertEqual({campo.column for campo in AuditLog._meta.fields}, {
            'id', 'usuario', 'ip_origen', 'metodo_accion', 'parametros_entrada',
            'texto_analizado', 'prediccion_emitida', 'tiempo_ejecucion_ms', 'fecha_registro'})

    @patch('modules.autenticacion.domain.models.AuditLog.objects.create')
    def test_guarda_texto_y_categoria(self, crear):
        @auditable('prueba_diagnostico')
        def diagnosticar(texto):
            return {'categoria_predecida': 'FALLO_DHCP'}
        resultado = diagnosticar('El equipo no recibe IP')
        campos = crear.call_args.kwargs
        self.assertEqual(campos['texto_analizado'], 'El equipo no recibe IP')
        self.assertEqual(campos['prediccion_emitida'], resultado['categoria_predecida'])
        self.assertEqual(campos['metodo_accion'], 'prueba_diagnostico')

    @patch('modules.autenticacion.domain.models.AuditLog.objects.create', side_effect=RuntimeError('prueba'))
    def test_fallo_de_auditoria_no_interrumpe_operacion(self, crear):
        @auditable('prueba')
        def operacion():
            return 42
        self.assertEqual(operacion(), 42)
