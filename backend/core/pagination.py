from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })

class PageSizePagination(PageNumberPagination):
    """Paginación con parámetros page/size y respuesta {content, totalElements, totalPages, number}."""
    page_size = 20
    page_query_param = 'page'
    page_size_query_param = 'size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'content': data,
            'totalElements': self.page.paginator.count,
            'totalPages': self.page.paginator.num_pages,
            'number': self.page.number,
        })
