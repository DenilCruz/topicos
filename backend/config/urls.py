"""
Root URL Configuration.
Routes requests to their respective business modules.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Business module endpoints
    path('api/v1/auth/', include('modules.autenticacion.api.urls')),
    path('api/v1/bonita/', include('modules.bonita.api.urls')),
    path('api/v1/nlp/', include('modules.nlp.api.urls')),
    path('api/v1/logs/', include('modules.logs.api.urls')),
    path('api/v1/tickets', include('modules.tickets.api.urls')),
    path('api/v1/dispositivos/', include('modules.tickets.api.dispositivos_urls')),
    path('api/v1/reports/', include('modules.reports.api.urls')),
]
