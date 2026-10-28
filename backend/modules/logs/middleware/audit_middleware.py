import time
from modules.logs.services.log_service import LogService

class AuditLogMiddleware:
    """
    Middleware that intercepts HTTP requests and asynchronously/synchronously records audit logs.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.log_service = LogService()

    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration_ms = round((time.time() - start_time) * 1000, 2)

        # Do not log static files or internal health checks
        if not request.path.startswith('/static/') and not request.path.startswith('/favicon.ico'):
            user_id = str(request.user) if request.user and request.user.is_authenticated else 'Anonymous'
            ip = request.META.get('HTTP_X_FORWARDED_FOR') or request.META.get('REMOTE_ADDR')

            try:
                self.log_service.record_http_event(
                    method=request.method,
                    path=request.path,
                    status_code=response.status_code,
                    duration_ms=duration_ms,
                    user_identifier=user_id,
                    ip_address=ip
                )
            except Exception:
                # Middleware should never crash the user request on logging failure
                pass

        return response
