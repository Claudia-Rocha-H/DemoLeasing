export type RequestType =
  | "CERTIFICATE"
  | "AUTHORIZATION"
  | "PAYMENT_ISSUE"
  | "CLAIM"
  | "PREPAYMENTS"
  | "DOCUMENT_COPY";

export type FileRequestPayload = {
  customerId: string;
  operationNumber: string;
  type: RequestType;
  description: string;
};

export type FiledRequest = {
  requestId: string;
  customerId: string;
  operationNumber: string;
  type: RequestType;
  description: string;
  status: string;
  filedAt: string;
  estimatedResolutionDate: string;
  operativeId: string | null;
  responseNote: string | null;
};

export type ContractStatus = "ACTIVE" | "IN_SINIESTRO" | "PENDING_REVIEW" | "CLOSED";

export type ContractCard = {
  contractId: string;
  customerId: string;
  operationNumber: string;
  asset: string;
  status: ContractStatus;
  progress: number;
  nextMilestone: string;
};

export type RequestJourneyStage = "FILED" | "CLASSIFIED" | "DISTRIBUTED" | "IN_ANALYSIS" | "RESPONDED" | "REJECTED";

export type ManagementUpdateType =
  | "FILED"
  | "CLASSIFIED"
  | "DISTRIBUTED"
  | "IN_ANALYSIS"
  | "DOCUMENTS_REQUESTED"
  | "IN_PROGRESS"
  | "RESPONDED"
  | "REJECTED"
  | "CLOSED"
  | "COMMENT";

export type ManagementUpdate = {
  type: ManagementUpdateType;
  title: string;
  detail: string;
  occurredAt: string;
  actor: string;
};

export type RequestSummary = {
  requestId: string;
  contractId: string;
  customerId: string;
  operationNumber: string;
  type: RequestType;
  title: string;
  status: "IN_PROGRESS" | "CLOSED" | "REJECTED";
  journeyStage: RequestJourneyStage;
  progress: number;
  filedAt: string;
  estimatedResolutionDate: string;
  responseNote: string | null;
  managementUpdates: ManagementUpdate[];
};
