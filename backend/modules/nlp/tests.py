"""Pruebas aisladas: no conectan a Supabase ni necesitan un modelo real."""
from types import SimpleNamespace
from unittest.mock import patch
from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.exceptions import ValidationError
from modules.nlp.api.views import DiagnosticarTicketView
from modules.nlp.adapters.modelo_entrenado import cargar_pipeline, ModeloNoDisponible
from modules.nlp.services.diagnostico_service import diagnosticar_ticket, TicketModificado


class PruebasDiagnostico(SimpleTestCase):
    def setUp(self):
        self.ticket = SimpleNamespace(pk=12, descripcion='El servidor DNS no responde',
                                      estado='PENDIENTE_DIAGNOSTICO', prioridad=None)
        self.resultado = {'categoria_predecida': 'DNS', 'probabilidad': 0.92,
                          'tiempo_inferencia_ms': 10}

    @patch('modules.nlp.services.diagnostico_service.Ticket.objects')
    @patch('modules.nlp.services.diagnostico_service.predecir_diagnostico')
    @patch('modules.nlp.services.diagnostico_service.get_object_or_404')
    def test_guarda_diagnostico(self, consultar, predecir, objetos):
        consultar.return_value = self.ticket
        predecir.return_value = self.resultado
        objetos.filter.return_value.update.return_value = 1
        resultado = diagnosticar_ticket.__wrapped__(12)
        self.assertEqual(resultado['estado'], 'DIAGNOSTICADO')
        campos = objetos.filter.return_value.update.call_args.kwargs
        self.assertEqual(campos['categoria_predecida'], 'DNS')
        self.assertNotIn('prioridad', campos)

    @patch('modules.nlp.services.diagnostico_service.Ticket.objects')
    @patch('modules.nlp.services.diagnostico_service.predecir_diagnostico')
    @patch('modules.nlp.services.diagnostico_service.get_object_or_404')
    def test_modelo_ausente_no_actualiza_ticket(self, consultar, predecir, objetos):
        consultar.return_value = self.ticket
        predecir.side_effect = ModeloNoDisponible()
        with self.assertRaises(ModeloNoDisponible):
            diagnosticar_ticket.__wrapped__(12)
        objetos.filter.assert_not_called()

    @patch('modules.nlp.services.diagnostico_service.get_object_or_404')
    def test_rechaza_ticket_resuelto(self, consultar):
        self.ticket.estado = 'RESUELTO'
        consultar.return_value = self.ticket
        with self.assertRaises(ValidationError):
            diagnosticar_ticket.__wrapped__(12)

    @patch('modules.nlp.services.diagnostico_service.Ticket.objects')
    @patch('modules.nlp.services.diagnostico_service.predecir_diagnostico')
    @patch('modules.nlp.services.diagnostico_service.get_object_or_404')
    def test_detecta_cambio_concurrente(self, consultar, predecir, objetos):
        consultar.return_value = self.ticket
        predecir.return_value = self.resultado
        objetos.filter.return_value.update.return_value = 0
        with self.assertRaises(TicketModificado):
            diagnosticar_ticket.__wrapped__(12)

    @patch('modules.nlp.api.views.diagnosticar_ticket')
    def test_api_valida_identificador_y_devuelve_resultado(self, diagnosticar):
        diagnosticar.return_value = self.resultado
        for identificador, codigo in [(12, 200), (0, 400)]:
            solicitud = APIRequestFactory().post('/', {'ticket_id': identificador}, format='json')
            force_authenticate(solicitud, user=SimpleNamespace(is_authenticated=True))
            respuesta = DiagnosticarTicketView.as_view()(solicitud)
            self.assertEqual(respuesta.status_code, codigo)

    @patch('modules.nlp.adapters.modelo_entrenado.joblib.load', side_effect=FileNotFoundError)
    def test_archivo_ausente(self, cargar):
        cargar_pipeline.cache_clear()
        with self.assertRaises(ModeloNoDisponible):
            cargar_pipeline('modelo-inexistente.joblib')
