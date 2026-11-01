from django.urls import path
from modules.nlp.api.views import AnalyzeTextView, DiagnosticarTicketView, PredecirTextoView
from modules.nlp.api.views import MetricasModeloView, EstadoModeloView

urlpatterns = [
    path('metricas/', MetricasModeloView.as_view(), name='nlp-metricas'),
    path('estado/', EstadoModeloView.as_view(), name='nlp-estado'),
    path('predecir/', PredecirTextoView.as_view(), name='nlp-predecir'),
    path('diagnosticar/', DiagnosticarTicketView.as_view(), name='nlp-diagnosticar'),
    path('analyze/', AnalyzeTextView.as_view(), name='nlp-analyze'),
]
