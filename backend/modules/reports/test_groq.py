import os
from unittest.mock import patch, Mock
from django.test import SimpleTestCase
from core.exceptions import DomainException
from modules.reports.services.groq_client import GroqClient
from modules.reports.services.report_service import crear_cliente_ia, DeepSeekClient, VoiceReportService
from modules.reports.api.views import VoiceQuerySerializer


class PruebasGroq(SimpleTestCase):
    def test_conserva_deepseek(self):
        self.assertIsInstance(crear_cliente_ia(), DeepSeekClient)

    def test_valida_proveedor(self):
        entrada = VoiceQuerySerializer(data={'texto': 'Resumen de incidentes', 'proveedor': 'invalido'})
        self.assertFalse(entrada.is_valid())

    @patch.dict(os.environ, {'GROQ_API_KEY': ''})
    def test_clave_ausente(self):
        with self.assertRaises(DomainException):
            GroqClient().completar('sistema', 'consulta')

    @patch.dict(os.environ, {'GROQ_API_KEY': 'clave-ficticia'})
    @patch('modules.reports.services.groq_client.requests.post')
    def test_respuesta_y_endpoint(self, enviar):
        enviar.return_value = Mock(status_code=200)
        enviar.return_value.json.return_value = {'choices': [{'message': {'content': 'Reporte generado'}}]}
        self.assertEqual(GroqClient().completar('sistema', 'consulta'), 'Reporte generado')
        self.assertEqual(enviar.call_args.args[0], 'https://api.groq.com/openai/v1/chat/completions')

    @patch.dict(os.environ, {'GROQ_API_KEY': 'clave-ficticia'})
    @patch('modules.reports.services.groq_client.requests.post')
    def test_limite_de_uso(self, enviar):
        enviar.return_value = Mock(status_code=429)
        with self.assertRaises(DomainException):
            GroqClient().completar('sistema', 'consulta')

    @patch('modules.reports.services.report_service.extraer_metricas', return_value={'total_historico': 3})
    def test_voz_envia_metricas_reales_del_servicio(self, metricas):
        cliente = Mock()
        cliente.completar.return_value = 'Hay tres incidentes.'
        resultado = VoiceReportService(cliente).generar_desde_voz('Cuantos hay')
        self.assertEqual(resultado['metrics']['total_historico'], 3)
        self.assertIn('3', cliente.completar.call_args.args[0])
