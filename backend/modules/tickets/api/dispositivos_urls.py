from django.urls import path
from modules.tickets.api.views import DispositivoListView

urlpatterns = [
    path('', DispositivoListView.as_view(), name='dispositivos-list'),
]
