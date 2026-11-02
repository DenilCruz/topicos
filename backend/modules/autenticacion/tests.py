"""
Tests unitarios y de integración para el Módulo 04: Autenticación, Seguridad y Auditoría.
Valida el cumplimiento formal del caso de uso UC-BE-08.
"""
from datetime import datetime, timezone
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from modules.autenticacion.domain.models import UserProfile, RoleChoices

class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.username = "admin_redes"
        self.password = "PasswordSeguro123!"
        
        # Crear usuario de prueba con perfil ADMIN
        self.user = User.objects.create_user(
            username=self.username,
            email="admin@mired.local",
            password=self.password
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            role=RoleChoices.ADMIN
        )

    def test_uc_be_08_login_exitoso_y_formato_respuesta(self):
        """
        UC-BE-08: Verifica que con credenciales válidas se retorne HTTP 200 con:
        token, type 'Bearer', username y roles ['ROLE_ADMIN'].
        """
        payload = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post("/api/v1/auth/login/", payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # Validar propiedades requeridas por el caso de uso
        self.assertIn("token", data)
        self.assertEqual(data.get("type"), "Bearer")
        self.assertEqual(data.get("username"), self.username)
        self.assertIn("ROLE_ADMIN", data.get("roles", []))
        
        # Validar compatibilidad con frontend existente
        self.assertIn("user", data)
        self.assertIn("tokens", data)

    def test_uc_be_08_expiracion_y_claims_del_token(self):
        """
        Valida que el token JWT incluya roles y tenga tiempo de expiración de 8 horas (28800 seg).
        """
        payload = {"username": self.username, "password": self.password}
        response = self.client.post("/api/v1/auth/login/", payload, format="json")
        token_str = response.json()["token"]
        
        # Decodificar el token con SimpleJWT
        token = AccessToken(token_str)
        
        # Validar claims del token
        self.assertEqual(token["username"], self.username)
        self.assertIn("ROLE_ADMIN", token["roles"])
        
        # Validar expiración (aprox. 8 horas = 28800 s con margen de 60 s)
        exp_timestamp = token["exp"]
        iat_timestamp = token["iat"]
        lifetime_seconds = exp_timestamp - iat_timestamp
        self.assertTrue(28740 <= lifetime_seconds <= 28860, f"Expiración esperada ~28800s, obtenida: {lifetime_seconds}s")

    def test_uc_be_08_criterio_aceptacion_rechazo_401_password_incorrecto(self):
        """
        Criterio de Aceptación: Rechazo con HTTP 401 Unauthorized ante credenciales erróneas.
        """
        payload = {
            "username": self.username,
            "password": "PasswordEquivocada999!"
        }
        response = self.client.post("/api/v1/auth/login/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_uc_be_08_criterio_aceptacion_rechazo_401_usuario_inexistente(self):
        """
        Criterio de Aceptación: Rechazo con HTTP 401 Unauthorized ante usuario no registrado.
        """
        payload = {
            "username": "usuario_no_existente",
            "password": "CualquierPassword123!"
        }
        response = self.client.post("/api/v1/auth/login/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_uc_be_08_soporta_ambas_rutas_con_y_sin_slash(self):
        """
        Verifica soporte tanto para /api/v1/auth/login como /api/v1/auth/login/
        """
        payload = {"username": self.username, "password": self.password}
        response_without_slash = self.client.post("/api/v1/auth/login", payload, format="json")
        self.assertEqual(response_without_slash.status_code, status.HTTP_200_OK)

    def test_uc_be_09_interceptor_usa_columnas_de_supabase(self):
        from unittest.mock import patch
        from modules.autenticacion.audit import auditable

        @auditable("DiagnosticoML")
        def servicio(texto):
            return {"categoria": "Configuracion_Switch_L2"}

        with patch('modules.autenticacion.domain.models.AuditLog.objects.create') as crear:
            resultado = servicio("El switch presenta puertos bloqueados por spanning tree")
        campos = crear.call_args.kwargs
        self.assertEqual(campos['prediccion_emitida'], resultado['categoria'])
        self.assertIn('spanning tree', campos['texto_analizado'])
        self.assertGreaterEqual(campos['tiempo_ejecucion_ms'], 0)
