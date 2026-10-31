from rest_framework import serializers
from modules.tickets.domain.models import Dispositivo, Ticket, Usuario

DESCRIPCION_MIN = 10
DESCRIPCION_MAX = 2000

class DispositivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dispositivo
        fields = ['id', 'nombre', 'tipo', 'ubicacion']

class TicketSerializer(serializers.ModelSerializer):
    dispositivoId = serializers.PrimaryKeyRelatedField(source='dispositivo', queryset=Dispositivo.objects.all())
    # Opcional: si no se envía, se usa el usuario autenticado (ver TicketListCreateView)
    usuarioId = serializers.PrimaryKeyRelatedField(source='usuario', queryset=Usuario.objects.all(), required=False)
    dispositivoNombre = serializers.CharField(source='dispositivo.nombre', read_only=True, default=None)
    usuarioNombre = serializers.CharField(source='usuario.username', read_only=True, default=None)
    fechaCreacion = serializers.DateTimeField(source='fecha_creacion', read_only=True)
    # Diagnóstico de ML: lo asigna la inferencia, no el cliente
    categoria = serializers.CharField(source='categoria_predecida', read_only=True)
    probabilidad = serializers.DecimalField(max_digits=4, decimal_places=3, coerce_to_string=False, read_only=True)
    tiempoInferenciaMs = serializers.IntegerField(source='tiempo_inferencia_ms', read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'titulo', 'descripcion', 'dispositivoId', 'dispositivoNombre', 'usuarioId', 'usuarioNombre',
            'estado', 'categoria', 'probabilidad', 'prioridad', 'tiempoInferenciaMs', 'fechaCreacion',
        ]
        read_only_fields = ['id', 'estado', 'prioridad']

    def validate_descripcion(self, value: str) -> str:
        longitud = len(value.strip())
        if longitud < DESCRIPCION_MIN or longitud > DESCRIPCION_MAX:
            raise serializers.ValidationError(
                f"La descripción debe tener entre {DESCRIPCION_MIN} y {DESCRIPCION_MAX} caracteres (actual: {longitud})."
            )
        return value.strip()
