from rest_framework.generics import ListAPIView, ListCreateAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.pagination import PageSizePagination
from modules.tickets.domain.models import Dispositivo, Ticket
from modules.tickets.api.filters import filter_tickets
from modules.tickets.api.serializers import DispositivoSerializer, TicketSerializer
from modules.tickets.services.usuario_service import resolver_usuario_negocio

class TicketListCreateView(ListCreateAPIView):
    """
    GET  -> UC-BE-02: consulta paginada con filtros categoria, prioridad, estado, fechaInicio y fechaFin.
    POST -> UC-BE-01: registra un ticket con estado inicial PENDIENTE_DIAGNOSTICO.
    """
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageSizePagination

    def get_queryset(self):
        queryset = Ticket.objects.select_related('usuario', 'dispositivo')
        return filter_tickets(queryset, self.request.query_params)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.validated_data.get('usuario') or resolver_usuario_negocio(request.user)
        serializer.save(usuario=usuario)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)

class DispositivoListView(ListAPIView):
    """Catálogo de dispositivos de red para asociar a los tickets."""
    serializer_class = DispositivoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    queryset = Dispositivo.objects.order_by('nombre')
