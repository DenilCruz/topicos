from dataclasses import dataclass
from typing import Optional, Dict, Any

@dataclass(frozen=True)
class BonitaProcess:
    id: str
    name: str
    version: str
    description: Optional[str] = None
    state: str = 'ENABLED'

@dataclass(frozen=True)
class BonitaCase:
    id: str
    process_definition_id: str
    state: str
    started_by: str
    started_date: str

@dataclass(frozen=True)
class BonitaTask:
    id: str
    name: str
    state: str
    case_id: str
    assigned_id: Optional[str] = None
