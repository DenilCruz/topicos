"""Pruebas aisladas: no conectan a Supabase ni necesitan un modelo real."""
from types import SimpleNamespace
from unittest.mock import patch
from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.exceptions import ValidationError
from modules.nlp.api.views import DiagnosticarTicketView
from modules.nlp.adapters.modelo_entrenado import cargar_pipeline, ModeloNoDisponible
from modules.nlp.services.diagnostico_service import diagnosticar_ticket, TicketModificado
from modules.nlp.api.views import MetricasModeloView, EstadoModeloView
from modules.nlp.services.consulta_modelo import consultar_metricas, MetricasNoDisponibles
from modules.nlp.services.consulta_modelo import consultar_revision_adicional
import numpy as np


class PruebasConsultasModelo(SimpleTestCase):
    @patch('modules.nlp.services.consulta_modelo.Path.read_text', return_value='{"modelo_sha256": "otra-version"}')
    def test_no_muestra_revision_de_otro_modelo(self, leer):
        self.assertIsNone(consultar_revision_adicional())

    def test_revision_actual_conserva_resultados(self):
        revision = consultar_revision_adicional()
        self.assertIsNotNone(revision)
        self.assertEqual(len(revision['casos']), 18)
        self.assertAlmostEqual(revision['accuracy'], 10 / 18)

    def consultar(self, vista, autenticar=True):
        solicitud = APIRequestFactory().get('/')
        if autenticar:
            force_authenticate(solicitud, user=SimpleNamespace(is_authenticated=True))
        return vista.as_view()(solicitud)

    def test_metricas_del_archivo_actual(self):
        respuesta = self.consultar(MetricasModeloView)
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(set(respuesta.data['data']['modelos']), {'regresion_logistica', 'naive_bayes'})
        self.assertNotIn('indices_entrenamiento', respuesta.data['data'])

    @patch('modules.nlp.services.consulta_modelo.Path.read_text', side_effect=FileNotFoundError)
    def test_metricas_ausentes(self, leer):
        self.assertEqual(self.consultar(MetricasModeloView).status_code, 503)

    @patch('modules.nlp.services.consulta_modelo.Path.read_text', return_value='{}')
    def test_metricas_incompletas(self, leer):
        with self.assertRaises(MetricasNoDisponibles):
            consultar_metricas()

    @patch('modules.nlp.services.consulta_modelo.Path.read_text', return_value='no es JSON')
    def test_metricas_corruptas(self, leer):
        self.assertEqual(self.consultar(MetricasModeloView).status_code, 503)

    @patch('modules.nlp.services.consulta_modelo.cargar_pipeline')
    def test_estado_listo(self, cargar):
        cargar.return_value = SimpleNamespace(classes_=['a', 'b'],
                                              predict_proba=lambda textos: np.array([[0.4, 0.6]]))
        respuesta = self.consultar(EstadoModeloView)
        self.assertEqual(respuesta.status_code, 200)
        self.assertTrue(respuesta.data['data']['pipeline_disponible'])

    @patch('modules.nlp.services.consulta_modelo.cargar_pipeline', side_effect=ModeloNoDisponible)
    def test_estado_sin_modelo(self, cargar):
        respuesta = self.consultar(EstadoModeloView)
        self.assertEqual(respuesta.status_code, 503)
        self.assertTrue(respuesta.data['data']['servicio_activo'])
        self.assertFalse(respuesta.data['data']['pipeline_disponible'])

    def test_consultas_requieren_autenticacion(self):
        for vista in [EstadoModeloView, MetricasModeloView]:
            self.assertEqual(self.consultar(vista, autenticar=False).status_code, 401)


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
