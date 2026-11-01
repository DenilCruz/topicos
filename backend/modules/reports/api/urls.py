from django.urls import path
from modules.reports.api.views import ExecutiveReportView, MetricsView, VoiceReportView

urlpatterns = [
    path('executive', ExecutiveReportView.as_view(), name='reports-executive'),
    path('metrics', MetricsView.as_view(), name='reports-metrics'),
    path('voice', VoiceReportView.as_view(), name='reports-voice'),
]
