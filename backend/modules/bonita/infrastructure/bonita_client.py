import os
import requests
from typing import List, Dict, Any, Optional
from modules.bonita.domain.entities import BonitaProcess, BonitaCase, BonitaTask, BonitaContractInput
from modules.bonita.domain.protocols import IBonitaClient
from core.exceptions import DomainException

class BonitaHttpClient(IBonitaClient):
    """
    HTTP REST Client implementation for Bonita BPM Engine.
    Handles session cookies, API tokens and payload mapping.
    """
    TOKEN_HEADER = 'X-Bonita-API-Token'

    def __init__(self, base_url: Optional[str] = None, username: Optional[str] = None, password: Optional[str] = None):
        self.base_url = (base_url or os.environ.get('BONITA_API_URL', 'http://localhost:8080/bonita')).rstrip('/')
        self.username = username or os.environ.get('BONITA_USERNAME', 'install')
        self.password = password or os.environ.get('BONITA_PASSWORD', 'install')
        self.session = requests.Session()
        self._authenticated = False

    def _login(self) -> None:
        """Abre sesión en /loginservice; Bonita devuelve la cookie JSESSIONID y el token anti-CSRF."""
        try:
            response = self.session.post(
                f"{self.base_url}/loginservice",
                data={'username': self.username, 'password': self.password, 'redirect': 'false'},
                timeout=10,
            )
        except requests.RequestException as e:
            raise DomainException(f"Error al conectar con Bonita BPM: {str(e)}", code="BONITA_CONNECTION_ERROR")

        token = self.session.cookies.get(self.TOKEN_HEADER)
        if response.status_code not in (200, 204) or not token:
            raise DomainException("Credenciales de Bonita BPM inválidas.", code="BONITA_AUTH_FAILED")

        self.session.headers[self.TOKEN_HEADER] = token
        self._authenticated = True

    def _request(self, method: str, path: str, **kwargs) -> requests.Response:
        """Ejecuta una llamada a /API autenticada; si la sesión expiró (401) inicia sesión y reintenta una vez."""
        if not self._authenticated:
            self._login()
        url = f"{self.base_url}/API/{path}"
        response = self.session.request(method, url, timeout=10, **kwargs)
        if response.status_code == 401:
            self._login()
            response = self.session.request(method, url, timeout=10, **kwargs)
        return response

    @staticmethod
    def _error_message(response: requests.Response) -> str:
        try:
            body = response.json()
            return body.get('explanations', [None])[0] or body.get('message') or response.text
        except ValueError:
            return response.text or f"HTTP {response.status_code}"

    def list_processes(self) -> List[BonitaProcess]:
        try:
            response = self._request('GET', 'bpm/process', params={'p': 0, 'c': 50})
            if response.status_code != 200:
                raise DomainException(f"Bonita respondió {response.status_code}: {self._error_message(response)}", code="BONITA_REQUEST_FAILED")
            return [
                BonitaProcess(
                    id=str(item.get('id')),
                    name=item.get('name', ''),
                    version=item.get('version', ''),
                    description=item.get('description'),
                    state=item.get('activationState', 'ENABLED')
                )
                for item in response.json()
            ]
        except requests.RequestException as e:
            raise DomainException(f"Error al conectar con Bonita BPM: {str(e)}", code="BONITA_CONNECTION_ERROR")

    def start_case(self, process_id: str, contract_variables: Optional[Dict[str, Any]] = None) -> BonitaCase:
        try:
            # Las entradas del contrato del proceso van directamente en el cuerpo
            response = self._request('POST', f'bpm/process/{process_id}/instantiation', json=contract_variables or {})
            if response.status_code not in (200, 201):
                raise DomainException(
                    f"No fue posible instanciar el caso en Bonita: {self._error_message(response)}",
                    code="BONITA_CASE_CREATION_FAILED",
                )
            case_id = str(response.json().get('caseId'))

            detail = self._request('GET', f'bpm/case/{case_id}')
            data = detail.json() if detail.status_code == 200 else {}
            return BonitaCase(
                id=case_id,
                process_definition_id=str(data.get('processDefinitionId', process_id)),
                state=data.get('state', 'started'),
                started_by=str(data.get('started_by', '')),
                started_date=str(data.get('start', ''))
            )
        except requests.RequestException as e:
            raise DomainException(f"Fallo de comunicación con Bonita BPM: {str(e)}", code="BONITA_REQUEST_FAILED")

    def list_pending_tasks(self, user_id: Optional[str] = None) -> List[BonitaTask]:
        try:
            params: List[tuple] = [('p', 0), ('c', 50), ('f', 'state=ready')]
            if user_id:
                params.append(('f', f'assigned_id={user_id}'))
            response = self._request('GET', 'bpm/humanTask', params=params)
            if response.status_code != 200:
                raise DomainException(f"Bonita respondió {response.status_code}: {self._error_message(response)}", code="BONITA_TASK_ERROR")
            return [
                BonitaTask(
                    id=str(item.get('id')),
                    name=item.get('displayName') or item.get('name', ''),
                    state=item.get('state', ''),
                    case_id=str(item.get('caseId', '')),
                    assigned_id=str(item.get('assigned_id', ''))
                )
                for item in response.json()
            ]
        except requests.RequestException as e:
            raise DomainException(f"Error al listar tareas de Bonita BPM: {str(e)}", code="BONITA_TASK_ERROR")

    def execute_task(self, task_id: str, task_variables: Optional[Dict[str, Any]] = None) -> bool:
        try:
            # assign=true: Bonita asigna la tarea al usuario de servicio antes de ejecutarla
            response = self._request(
                'POST', f'bpm/userTask/{task_id}/execution', params={'assign': 'true'}, json=task_variables or {}
            )
            if response.status_code not in (200, 204):
                raise DomainException(
                    f"No fue posible completar la tarea: {self._error_message(response)}",
                    code="BONITA_EXECUTE_ERROR",
                )
            return True
        except requests.RequestException as e:
            raise DomainException(f"Error al ejecutar tarea en Bonita BPM: {str(e)}", code="BONITA_EXECUTE_ERROR")

    def _get_contract(self, path: str) -> List[BonitaContractInput]:
        try:
            response = self._request('GET', path)
            if response.status_code != 200:
                raise DomainException(f"Bonita respondió {response.status_code}: {self._error_message(response)}", code="BONITA_CONTRACT_ERROR")
            return [
                BonitaContractInput(
                    name=item.get('name', ''),
                    type=item.get('type') or 'COMPLEX',
                    description=item.get('description'),
                    multiple=bool(item.get('multiple', False)),
                )
                for item in response.json().get('inputs', [])
            ]
        except requests.RequestException as e:
            raise DomainException(f"Error al obtener el contrato de Bonita BPM: {str(e)}", code="BONITA_CONTRACT_ERROR")

    def get_process_contract(self, process_id: str) -> List[BonitaContractInput]:
        return self._get_contract(f'bpm/process/{process_id}/contract')

    def get_task_contract(self, task_id: str) -> List[BonitaContractInput]:
        return self._get_contract(f'bpm/userTask/{task_id}/contract')
