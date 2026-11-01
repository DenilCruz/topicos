export interface BonitaProcess {
  id: string;
  name: string;
  version: string;
  description: string | null;
  state: string;
}

export interface BonitaCase {
  id: string;
  process_definition_id: string;
  state: string;
  started_by: string;
  started_date: string;
}

export interface BonitaTask {
  id: string;
  name: string;
  state: string;
  case_id: string;
  assigned_id?: string;
}

/** Entrada del contrato de un proceso o tarea (LONG, INTEGER, DECIMAL, TEXT, BOOLEAN, DATE, ...). */
export interface BonitaContractInput {
  name: string;
  type: string;
  description: string | null;
  multiple: boolean;
}
