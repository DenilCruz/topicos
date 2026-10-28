from django.urls import path
from modules.nlp.api.views import AnalyzeTextView

urlpatterns = [
    path('analyze/', AnalyzeTextView.as_view(), name='nlp-analyze'),
]
