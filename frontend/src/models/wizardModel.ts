import type { RequestType } from "./requests";

export type WizardStep = 1 | 2 | 3;

export type WizardState = {
  contractId: string;
  customerId: string;
  operationNumber: string;
  type: RequestType;
  description: string;
  evidenceFiles: File[];
};

export const initialWizardState: WizardState = {
  contractId: "",
  customerId: "",
  operationNumber: "",
  type: "CERTIFICATE",
  description: "",
  evidenceFiles: []
};

export const requestTypeOptions: Array<{ value: RequestType; title: string; description: string }> = [
  { value: "CERTIFICATE", title: "Certificados", description: "Comprobantes, estados y soportes formales." },
  { value: "AUTHORIZATION", title: "Autorizaciones", description: "Gestiones que requieren aprobacion del contrato." },
  { value: "PAYMENT_ISSUE", title: "Problemas de pago", description: "Novedades de cartera o reversos." },
  { value: "CLAIM", title: "Siniestros", description: "Eventos, danos y validaciones de cobertura." },
  { value: "PREPAYMENTS", title: "Prepago", description: "Liquidaciones anticipadas y simulaciones." },
  { value: "DOCUMENT_COPY", title: "Copia documental", description: "Duplicados, anexos y documentacion historica." }
];
