import type { RequestType } from "../models/requests";

export type SlaStep = {
  label: string;
  businessDays: number;
};

const slaPlan: Record<RequestType, SlaStep[]> = {
  CERTIFICATE: [
    { label: "Radicado", businessDays: 1 },
    { label: "Clasificado", businessDays: 1 },
    { label: "Distribuido", businessDays: 1 },
    { label: "En análisis", businessDays: 1 },
    { label: "Respuesta", businessDays: 1 }
  ],
  AUTHORIZATION: [
    { label: "Radicado", businessDays: 1 },
    { label: "Clasificado", businessDays: 1 },
    { label: "Distribuido", businessDays: 1 },
    { label: "En análisis", businessDays: 2 },
    { label: "Respuesta", businessDays: 1 }
  ],
  PAYMENT_ISSUE: [
    { label: "Radicado", businessDays: 1 },
    { label: "Clasificado", businessDays: 1 },
    { label: "Distribuido", businessDays: 1 },
    { label: "En análisis", businessDays: 3 },
    { label: "Respuesta", businessDays: 1 }
  ],
  CLAIM: [
    { label: "Radicado", businessDays: 1 },
    { label: "Clasificado", businessDays: 2 },
    { label: "Distribuido", businessDays: 2 },
    { label: "En análisis", businessDays: 4 },
    { label: "Respuesta", businessDays: 1 }
  ],
  PREPAYMENTS: [
    { label: "Radicado", businessDays: 1 },
    { label: "Clasificado", businessDays: 1 },
    { label: "Distribuido", businessDays: 1 },
    { label: "En análisis", businessDays: 2 },
    { label: "Respuesta", businessDays: 1 }
  ],
  DOCUMENT_COPY: [
    { label: "Radicado", businessDays: 1 },
    { label: "Clasificado", businessDays: 1 },
    { label: "Distribuido", businessDays: 1 },
    { label: "En análisis", businessDays: 1 },
    { label: "Respuesta", businessDays: 1 }
  ]
};

export function getSlaPlan(type: RequestType): SlaStep[] {
  return slaPlan[type];
}

export function calculateEstimatedResolutionDate(type: RequestType, startDate = new Date()) {
  const totalBusinessDays = getSlaPlan(type).reduce((total, step) => total + step.businessDays, 0);
  return addBusinessDays(startDate, totalBusinessDays);
}

export function addBusinessDays(date: Date, days: number) {
  const next = new Date(date);
  let remaining = days;

  while (remaining > 0) {
    next.setDate(next.getDate() + 1);
    const day = next.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return next;
}

export function buildDescription(parts: Array<string | undefined | null>) {
  return parts.filter((part): part is string => Boolean(part && part.trim())).join(" • ");
}

export function getProgressFromStage(stageIndex: number) {
  const safeIndex = Math.max(0, Math.min(stageIndex, 4));
  return Math.round(((safeIndex + 1) / 5) * 100);
}

export function getCountdownMessage(targetDate: Date | string) {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const diff = target.getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return days === 0 ? "Hoy tienes respuesta oficial" : `Faltan ${days} días para tu respuesta oficial`;
}
