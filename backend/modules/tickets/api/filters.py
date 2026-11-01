from datetime import date, datetime, timezone as dt_timezone
from typing import Optional
from django.db.models import Q, QuerySet
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from rest_framework.exceptions import ValidationError

def _parse_fecha(param: str, value: str) -> date | datetime:
    """Acepta 'YYYY-MM-DD' o un datetime ISO 8601; los datetime sin zona se asumen en UTC."""
    try:
        # parse_date primero: parse_datetime también acepta 'YYYY-MM-DD' y lo convierte en medianoche
        parsed = parse_date(value) or parse_datetime(value)
    except ValueError:
        parsed = None
    if parsed is None:
        raise ValidationError({param: [f"Fecha inválida '{value}'. Use YYYY-MM-DD o ISO 8601."]})
    if isinstance(parsed, datetime) and timezone.is_naive(parsed):
        parsed = timezone.make_aware(parsed, dt_timezone.utc)
    return parsed

def build_ticket_filters(params) -> Q:
    """Construye la condición dinámica a partir de los query params de UC-BE-02."""
    condicion = Q()

    for param, campo in (('categoria', 'categoria_predecida'), ('prioridad', 'prioridad'), ('estado', 'estado')):
        valor: Optional[str] = params.get(param)
        if valor:
            condicion &= Q(**{campo: valor})

    if fecha_inicio := params.get('fechaInicio'):
        inicio = _parse_fecha('fechaInicio', fecha_inicio)
        # Una fecha sin hora incluye el día completo
        lookup = 'fecha_creacion__gte' if isinstance(inicio, datetime) else 'fecha_creacion__date__gte'
        condicion &= Q(**{lookup: inicio})

    if fecha_fin := params.get('fechaFin'):
        fin = _parse_fecha('fechaFin', fecha_fin)
        lookup = 'fecha_creacion__lte' if isinstance(fin, datetime) else 'fecha_creacion__date__lte'
        condicion &= Q(**{lookup: fin})

    return condicion

def filter_tickets(queryset: QuerySet, params) -> QuerySet:
    return queryset.filter(build_ticket_filters(params))
