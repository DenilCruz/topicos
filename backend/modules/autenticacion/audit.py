"""
Aspecto / Decorador de Auditoría para el Módulo 04 (UC-BE-09).
Implementa el interceptor @auditable (equivalente al aspecto AOP @Around)
para registrar un historial inalterable de operaciones y diagnósticos sin interferir
con la transacción principal.
"""
import time
import functools
import logging
from typing import Callable, Any, Optional

logger = logging.getLogger(__name__)

def auditable(action_name: Optional[str] = None):
    """
    UC-BE-09: Registro de Auditoría de Diagnósticos y Operaciones
    1. Intercepta llamadas a servicios clave (inferencia de ML, modificación de tickets).
    2. Captura identidad del usuario, dirección IP, parámetros de entrada y timestamp.
    3. Mide el tiempo de ejecución en milisegundos.
    4. Guarda una nueva entrada en la tabla audit_logs de forma aislada sin interferir
       con la transacción principal.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            user_identifier = 'Anonymous'
            ip_address = '127.0.0.1'
            
            # Extraer información de contexto si se pasa un request
            request = kwargs.get('request')
            if not request:
                for arg in args:
                    if hasattr(arg, 'user') and hasattr(arg, 'META'):
                        request = arg
                        break

            if request:
                if hasattr(request, 'user') and getattr(request.user, 'is_authenticated', False):
                    user_identifier = str(request.user.username)
                ip_address = (
                    request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
                    or request.META.get('REMOTE_ADDR')
                    or '127.0.0.1'
                )

            # Captura de parámetros de entrada (texto, payload)
            input_summary = {
                'args': [str(a) for a in args if not hasattr(a, '__dict__') and not hasattr(a, 'META')],
                'kwargs': {k: str(v) for k, v in kwargs.items() if k != 'request'}
            }

            exception_raised = None
            result = None
            try:
                # Ejecución de la operación principal
                result = func(*args, **kwargs)
                return result
            except Exception as exc:
                exception_raised = exc
                raise
            finally:
                duration_ms = round((time.time() - start_time) * 1000, 2)
                op_name = action_name or func.__name__

                # Persistencia no bloqueante en la tabla de auditoría (audit_logs)
                try:
                    from modules.autenticacion.domain.models import AuditLog
                    
                    output_summary = str(result) if not exception_raised else f"ERROR: {exception_raised}"
                    audit_message = f"Acción: {op_name} | Entrada: {input_summary} | Salida/Predicción: {output_summary}"
                    severity = 'ERROR' if exception_raised else 'INFO'
                    status_code = 500 if exception_raised else 200

                    AuditLog.objects.create(
                        method='AUDIT',
                        path=f"operation://{op_name}",
                        status_code=status_code,
                        duration_ms=duration_ms,
                        user_identifier=user_identifier,
                        ip_address=ip_address,
                        severity=severity,
                        message=audit_message
                    )
                except Exception as log_error:
                    # Garantiza que el fallo de auditoría jamás interfiera con la operación principal
                    logger.warning(f"Error registrando auditoría en audit_logs: {log_error}")

        return wrapper
    return decorator

