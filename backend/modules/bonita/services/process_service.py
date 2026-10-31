from typing import List, Dict, Any, Optional
from modules.bonita.domain.protocols import IBonitaClient
from modules.bonita.domain.entities import BonitaProcess, BonitaCase, BonitaTask, BonitaContractInput
from modules.bonita.infrastructure.bonita_client import BonitaHttpClient

class BonitaProcessService:
    """
    Application Service orchestrating Bonita BPM business logic.
    Follows Dependency Inversion (depends on IBonitaClient abstraction).
    """
    def __init__(self, client: Optional[IBonitaClient] = None):
        self._client: IBonitaClient = client or BonitaHttpClient()

    def get_available_processes(self) -> List[BonitaProcess]:
        return self._client.list_processes()

    def start_process_instance(self, process_id: str, contract_data: Optional[Dict[str, Any]] = None) -> BonitaCase:
        return self._client.start_case(process_id, contract_data)

    def get_user_tasks(self, user_id: Optional[str] = None) -> List[BonitaTask]:
        return self._client.list_pending_tasks(user_id)

    def complete_user_task(self, task_id: str, payload: Optional[Dict[str, Any]] = None) -> bool:
        return self._client.execute_task(task_id, payload)

    def get_process_contract(self, process_id: str) -> List[BonitaContractInput]:
        return self._client.get_process_contract(process_id)

    def get_task_contract(self, task_id: str) -> List[BonitaContractInput]:
        return self._client.get_task_contract(task_id)
