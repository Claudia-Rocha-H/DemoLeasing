import type { ContractCard, FileRequestPayload, FiledRequest, ManagementUpdate, RequestSummary } from "../models/requests";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

export async function fetchContracts(customerId?: string): Promise<ContractCard[]> {
  const query = customerId ? `?customerId=${encodeURIComponent(customerId)}` : "";
  const response = await fetch(`${API_BASE_URL}/portal/contracts${query}`);

  if (!response.ok) {
    throw new Error("Unable to load contracts.");
  }

  return (await response.json()) as ContractCard[];
}

export async function fetchRequestSummaries(customerId?: string): Promise<RequestSummary[]> {
  const query = customerId ? `?customerId=${encodeURIComponent(customerId)}` : "";
  const response = await fetch(`${API_BASE_URL}/portal/requests${query}`);

  if (!response.ok) {
    throw new Error("Unable to load requests.");
  }

  const raw = (await response.json()) as Array<Record<string, unknown>>;
  return raw.map(normalizeRequestSummary);
}

function normalizeRequestSummary(item: Record<string, unknown>): RequestSummary {
  const managementUpdatesRaw = Array.isArray(item.managementUpdates)
    ? item.managementUpdates
    : Array.isArray(item.notes)
      ? item.notes.map((note) => ({
        type: "COMMENT",
        title: "Actualizacion",
        detail: String(note ?? "Estado actualizado"),
        occurredAt: String(item.filedAt ?? new Date().toISOString()),
        actor: "system"
      }))
      : [];

  const managementUpdates = managementUpdatesRaw.map((update) => normalizeManagementUpdate(update));

  return {
    requestId: String(item.requestId ?? ""),
    contractId: String(item.contractId ?? ""),
    customerId: String(item.customerId ?? ""),
    operationNumber: String(item.operationNumber ?? ""),
    type: String(item.type ?? "CERTIFICATE") as RequestSummary["type"],
    title: String(item.title ?? "Solicitud"),
    status: String(item.status ?? "IN_PROGRESS") as RequestSummary["status"],
    journeyStage: String(item.journeyStage ?? "FILED") as RequestSummary["journeyStage"],
    progress: Number(item.progress ?? 0),
    filedAt: String(item.filedAt ?? new Date().toISOString()),
    estimatedResolutionDate: String(item.estimatedResolutionDate ?? new Date().toISOString()),
    responseNote: item.responseNote == null ? null : String(item.responseNote),
    managementUpdates
  };
}

function normalizeManagementUpdate(raw: unknown): ManagementUpdate {
  const update = (raw ?? {}) as Record<string, unknown>;
  return {
    type: String(update.type ?? "COMMENT") as ManagementUpdate["type"],
    title: String(update.title ?? "Actualizacion"),
    detail: String(update.detail ?? "Estado actualizado"),
    occurredAt: String(update.occurredAt ?? new Date().toISOString()),
    actor: String(update.actor ?? "system")
  };
}

export async function fileRequest(payload: FileRequestPayload): Promise<FiledRequest> {
  const response = await fetch(`${API_BASE_URL}/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to file request. Please verify contract data.");
  }

  return (await response.json()) as FiledRequest;
}

export async function deleteRequest(requestId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/requests/${encodeURIComponent(requestId)}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to delete request.");
  }
}

export async function classifyRequest(requestId: string, note: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/requests/classify`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ requestId, note })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to classify request.");
  }
}

export async function distributeRequest(requestId: string, operativeId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/requests/assign`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ requestId, operativeId })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to distribute request.");
  }
}

export async function registerOperationalUpdate(
  requestId: string,
  operatorName: string,
  action: "START_ANALYSIS" | "REQUEST_DOCUMENTS" | "ADD_NOTE",
  detail: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/requests/operational-update`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ requestId, operatorName, action, detail })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to register operational update.");
  }
}

export async function rejectRequest(requestId: string, reason: string, operatorName?: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/requests/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ requestId, reason, operatorName })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to reject request.");
  }
}
