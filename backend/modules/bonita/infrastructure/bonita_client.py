import os
import requests
from typing import List, Dict, Any, Optional
from modules.bonita.domain.entities import BonitaProcess, BonitaCase, BonitaTask
from modules.bonita.domain.protocols import IBonitaClient
from core.exceptions import DomainException

class BonitaHttpClient(IBonitaClient):
    """
    HTTP REST Client implementation for Bonita BPM Engine.
    Handles session cookies, API tokens and payload mapping.
    """
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or os.environ.get('BONITA_API_URL', 'http://localhost:8080/bonita')
        self.session = requests.Session()

    def list_processes(self) -> List[BonitaProcess]:
        try:
            url = f"{self.base_url}/API/bpm/process?p=0&c=50"
            response = self.session.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return [
                    BonitaProcess(
                        id=str(item.get('id')),
                        name=item.get('name', ''),
                        version=item.get('version', ''),
                        description=item.get('description'),
                        state=item.get('activationState', 'ENABLED')
                    )
                    for item in data
                ]
            return []
        except requests.RequestException as e:
            raise DomainException(f"Error al conectar con Bonita BPM: {str(e)}", code="BONITA_CONNECTION_ERROR")

    def start_case(self, process_id: str, contract_variables: Optional[Dict[str, Any]] = None) -> BonitaCase:
        try:
            url = f"{self.base_url}/API/bpm/case"
            payload = {"processDefinitionId": process_id, "variables": contract_variables or {}}
            response = self.session.post(url, json=payload, timeout=10)
            if response.status_code in (200, 201):
                data = response.json()
                return BonitaCase(
                    id=str(data.get('id')),
                    process_definition_id=str(data.get('processDefinitionId')),
                    state=data.get('state', 'started'),
                    started_by=str(data.get('started_by', '')),
                    started_date=str(data.get('start', ''))
                )
            raise DomainException("No fue posible instanciar el caso en Bonita.", code="BONITA_CASE_CREATION_FAILED")
        except requests.RequestException as e:
            raise DomainException(f"Fallo de comunicación con Bonita BPM: {str(e)}", code="BONITA_REQUEST_FAILED")

    def list_pending_tasks(self, user_id: Optional[str] = None) -> List[BonitaTask]:
        try:
            url = f"{self.base_url}/API/bpm/humanTask?p=0&c=50"
            if user_id:
                url += f"&f=assigned_id={user_id}"
            response = self.session.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return [
                    BonitaTask(
                        id=str(item.get('id')),
                        name=item.get('name', ''),
                        state=item.get('state', ''),
                        case_id=str(item.get('caseId', '')),
                        assigned_id=str(item.get('assigned_id', ''))
                    )
                    for item in data
                ]
            return []
        except requests.RequestException as e:
            raise DomainException(f"Error al listar tareas de Bonita BPM: {str(e)}", code="BONITA_TASK_ERROR")

    def execute_task(self, task_id: str, task_variables: Optional[Dict[str, Any]] = None) -> bool:
        try:
            url = f"{self.base_url}/API/bpm/userTask/{task_id}/execution"
            response = self.session.post(url, json=task_variables or {}, timeout=10)
            return response.status_code in (200, 204)
        except requests.RequestException as e:
            raise DomainException(f"Error al ejecutar tarea en Bonita BPM: {str(e)}", code="BONITA_EXECUTE_ERROR")
