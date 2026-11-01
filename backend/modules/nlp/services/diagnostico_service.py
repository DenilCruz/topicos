"""Clasificación de tickets pendientes y persistencia del diagnóstico."""
from decimal import Decimal
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import APIException, ValidationError
from modules.autenticacion.audit import auditable
from modules.tickets.domain.models import Ticket, TicketEstado
from modules.nlp.adapters.modelo_entrenado import predecir_diagnostico


class TicketModificado(APIException):
    status_code = 409
    default_detail = 'El ticket cambió durante el diagnóstico. Vuelve a consultarlo.'


@auditable('diagnosticar_ticket')
def diagnosticar_ticket(ticket_id, request=None):
    ticket = get_object_or_404(Ticket, pk=ticket_id)
    if ticket.estado != TicketEstado.PENDIENTE_DIAGNOSTICO:
        raise ValidationError('Solo se pueden diagnosticar tickets pendientes de diagnóstico.')
    if not ticket.descripcion or not 10 <= len(ticket.descripcion.strip()) <= 2000:
        raise ValidationError('La descripción debe contener entre 10 y 2000 caracteres.')

    diagnostico = predecir_diagnostico(ticket.descripcion)
    # Una actualización condicional evita sobrescribir un ticket que cambió
    # mientras el modelo procesaba el texto. No hay cambios si falla la inferencia.
    actualizados = Ticket.objects.filter(
        pk=ticket.pk, estado=TicketEstado.PENDIENTE_DIAGNOSTICO,
        descripcion=ticket.descripcion,
    ).update(
        categoria_predecida=diagnostico['categoria_predecida'],
        probabilidad=Decimal(str(diagnostico['probabilidad'])),
        tiempo_inferencia_ms=diagnostico['tiempo_inferencia_ms'],
        estado=TicketEstado.DIAGNOSTICADO, fecha_actualizacion=timezone.now(),
    )
    if not actualizados:
        raise TicketModificado()
    return {'ticket_id': ticket.pk, **diagnostico,
            'estado': TicketEstado.DIAGNOSTICADO, 'prioridad': ticket.prioridad}
