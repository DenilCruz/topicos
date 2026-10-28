from django.urls import path
from modules.logs.api.views import AuditLogListView

urlpatterns = [
    path('', AuditLogListView.as_view(), name='logs-list'),
]
