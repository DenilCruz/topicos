from django.urls import path
from modules.tickets.api.views import TicketListCreateView

urlpatterns = [
    path('', TicketListCreateView.as_view(), name='tickets-list-create'),
]
