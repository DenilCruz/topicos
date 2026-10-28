"""
Custom exception handling for consistent API responses.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

class DomainException(Exception):
    """Base exception for domain and business rule violations."""
    def __init__(self, message: str, code: str = "BUSINESS_RULE_ERROR"):
        super().__init__(message)
        self.message = message
        self.code = code

def custom_exception_handler(exc, context):
    """Transforms DRF and Domain exceptions into unified JSON format."""
    response = exception_handler(exc, context)

    if isinstance(exc, DomainException):
        return Response(
            {
                "success": False,
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                }
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if response is not None:
        response.data = {
            "success": False,
            "error": {
                "code": "REQUEST_ERROR",
                "details": response.data
            }
        }

    return response
