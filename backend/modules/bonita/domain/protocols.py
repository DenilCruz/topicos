from typing import Protocol, List, Dict, Any, Optional
from modules.bonita.domain.entities import BonitaProcess, BonitaCase, BonitaTask, BonitaContractInput

class IBonitaClient(Protocol):
    """Abstraction for external Bonita BPM engine communication."""
    
    def list_processes(self) -> List[BonitaProcess]:
        ...

    def start_case(self, process_id: str, contract_variables: Optional[Dict[str, Any]] = None) -> BonitaCase:
        ...

    def list_pending_tasks(self, user_id: Optional[str] = None) -> List[BonitaTask]:
        ...

    def execute_task(self, task_id: str, task_variables: Optional[Dict[str, Any]] = None) -> bool:
        ...

    def get_process_contract(self, process_id: str) -> List[BonitaContractInput]:
        ...

    def get_task_contract(self, task_id: str) -> List[BonitaContractInput]:
        ...
