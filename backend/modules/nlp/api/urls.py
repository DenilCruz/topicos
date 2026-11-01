from django.urls import path
from modules.nlp.api.views import AnalyzeTextView, DiagnosticarTicketView, PredecirTextoView

urlpatterns = [
    path('predecir/', PredecirTextoView.as_view(), name='nlp-predecir'),
    path('diagnosticar/', DiagnosticarTicketView.as_view(), name='nlp-diagnosticar'),
    path('analyze/', AnalyzeTextView.as_view(), name='nlp-analyze'),
]
