import { useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, CircleDashed, ClipboardList, Clock3, FileSearch, FolderCheck, Gauge, Landmark, MessageSquareText, Route } from "lucide-react";
import { BrandButton } from "../../components/BrandButton";
import { getCountdownMessage, getProgressFromStage, getSlaPlan } from "../../utils/requestWorkflow";
import { formatDate } from "../../utils/formatDate";
import type { ManagementUpdate, RequestSummary } from "../../models/requests";

type RequestStatusTrackerProps = {
  requests: RequestSummary[];
  request: RequestSummary;
  onSelectRequest: (requestId: string) => void;
  canDeleteRequest: boolean;
  isDeletingRequest: boolean;
  onDeleteRequest: (requestId: string) => void;
};

const journey = ["Radicado", "Clasificado", "Distribuido", "En análisis", "Respuesta enviada"];

export function RequestStatusTracker({
  requests,
  request,
  onSelectRequest,
  canDeleteRequest,
  isDeletingRequest,
  onDeleteRequest
}: RequestStatusTrackerProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const updates = [...(request.managementUpdates ?? [])].sort((left, right) => {
    const leftTime = Date.parse(left.occurredAt);
    const rightTime = Date.parse(right.occurredAt);
    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    return updateRank(left.type) - updateRank(right.type);
  });
  const currentIndex = stageToIndex(request.journeyStage);
  const progress = getProgressFromStage(currentIndex);
  const totalDays = getSlaPlan(request.type).reduce((total, item) => total + item.businessDays, 0);
  const currentStageLabel = request.status === "REJECTED" ? "Rechazada" : journey[currentIndex] ?? journey[0];
  const hasRejectionReason = request.status === "REJECTED" && Boolean(request.responseNote?.trim());

  useEffect(() => {
    setIsDeleteConfirmOpen(false);
  }, [request.requestId]);

  const openDeleteConfirm = () => {
    if (!canDeleteRequest || isDeletingRequest) {
      return;
    }
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    setIsDeleteConfirmOpen(false);
    onDeleteRequest(request.requestId);
  };

  return (
    <section className="space-y-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:p-8">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)]/75 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">Seguimiento</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--heading)]">Estado de tu solicitud</h1>
            <p className="mt-2 max-w-3xl text-sm text-[var(--muted)] sm:text-base">
              Revisa el avance real por etapas, el tiempo estimado y las actualizaciones más recientes del caso.
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              {request.requestId} · {request.operationNumber}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <TopMetric
              icon={<Clock3 aria-hidden="true" size={16} strokeWidth={2.2} />}
              label="Tiempo restante"
              value={request.status === "REJECTED" ? "Solicitud rechazada" : getCountdownMessage(request.estimatedResolutionDate)}
            />
            <TopMetric
              icon={<Route aria-hidden="true" size={16} strokeWidth={2.2} />}
              label="Etapa actual"
              value={currentStageLabel}
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="requestSelector" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Cambiar solicitud
          </label>
          <select
            id="requestSelector"
            value={request.requestId}
            onChange={(event) => onSelectRequest(event.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {requests.map((item) => (
              <option key={item.requestId} value={item.requestId}>
                {item.requestId} · {item.operationNumber} · {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex justify-end">
          <BrandButton
            type="button"
            variant="secondary"
            onClick={openDeleteConfirm}
            disabled={!canDeleteRequest || isDeletingRequest}
          >
            {isDeletingRequest ? "Eliminando..." : "Eliminar solicitud"}
          </BrandButton>
        </div>
      </div>

      {request.status === "REJECTED" && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-800 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-700">Solicitud rechazada</p>
          <h2 className="mt-2 text-xl font-black">La solicitud fue rechazada por el equipo operativo.</h2>
          <p className="mt-2 text-sm text-red-900/85">
            {hasRejectionReason ? request.responseNote : "No se registró un motivo detallado para esta decisión."}
          </p>
        </div>
      )}

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 lg:p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileSearch aria-hidden="true" size={16} strokeWidth={2.2} className="text-[var(--muted)]" />
          <h2 className="text-lg font-bold text-[var(--heading)]">Ruta del caso</h2>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <LegendChip label="Completado" dotClass="bg-[var(--status-active-dot)]" chipClass="border-[var(--status-active-border)] bg-[var(--status-active-bg)] text-[var(--status-active-text)]" />
          <LegendChip label="En curso" dotClass="bg-[var(--status-progress-dot)]" chipClass="border-[var(--status-progress-border)] bg-[var(--status-progress-bg)] text-[var(--status-progress-text)]" />
          <LegendChip label="Pendiente" dotClass="bg-[var(--status-default-dot)]" chipClass="border-[var(--status-default-border)] bg-[var(--surface-2)] text-[var(--status-default-text)]" />
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {journey.map((label, index) => {
          const routeLabel = request.status === "REJECTED" && index === journey.length - 1 ? "Rechazada" : label;
          const active = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const tone = index < currentIndex
            ? {
              card: "border-[var(--status-active-border)] bg-[var(--status-active-bg)]",
              iconWrap: "border-[var(--status-active-border)] bg-white",
              icon: "text-[var(--status-active-dot)]",
              state: "text-[var(--status-active-text)]",
              text: "Completado"
            }
            : isCurrent
              ? {
                card: "border-[var(--status-progress-border)] bg-[var(--status-progress-bg)]",
                iconWrap: "border-[var(--status-progress-border)] bg-white",
                icon: "text-[var(--status-progress-dot)]",
                state: "text-[var(--status-progress-text)]",
                text: "En curso"
              }
              : {
                card: "border-[var(--border)] bg-[var(--surface-2)]",
                iconWrap: "border-[var(--border)] bg-white",
                icon: "text-[var(--status-default-dot)]",
                state: "text-[var(--muted)]",
                text: "Pendiente"
              };

          return (
            <div
              key={routeLabel}
              className={`rounded-2xl border p-4 ${tone.card}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[var(--heading)]">{routeLabel}</p>
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${tone.iconWrap}`}>
                  {active
                    ? <CheckCircle2 aria-hidden="true" size={14} strokeWidth={2.3} className={tone.icon} />
                    : <CircleDashed aria-hidden="true" size={14} strokeWidth={2.2} className={tone.icon} />}
                </span>
              </div>
              <p className={`mt-2 text-sm font-medium ${tone.state}`}>{tone.text}</p>
            </div>
          );
        })}
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Gauge aria-hidden="true" size={17} strokeWidth={2.2} className="text-[var(--muted)]" />
            <h2 className="text-xl font-bold text-[var(--heading)]">Estado general</h2>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-[var(--muted)]">
              <span>Progreso visible</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-black/10">
              <div className="h-3 rounded-full bg-[var(--accent)]" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <Row icon={<CalendarClock aria-hidden="true" size={15} strokeWidth={2.2} />} label="Radicado" value={formatDate(request.filedAt)} />
            <Row icon={<ClipboardList aria-hidden="true" size={15} strokeWidth={2.2} />} label="Operación" value={request.operationNumber} />
            <Row icon={<Landmark aria-hidden="true" size={15} strokeWidth={2.2} />} label="Contrato" value={request.contractId} />
            <Row icon={<Clock3 aria-hidden="true" size={15} strokeWidth={2.2} />} label="ANS estimado" value={`${totalDays} días hábiles`} />
            {request.status === "REJECTED" ? (
              <Row
                icon={<FolderCheck aria-hidden="true" size={15} strokeWidth={2.2} />}
                label="Motivo de rechazo"
                value={request.responseNote ?? "Sin motivo registrado"}
              />
            ) : (
              <Row icon={<FolderCheck aria-hidden="true" size={15} strokeWidth={2.2} />} label="Respuesta oficial" value={formatDate(request.estimatedResolutionDate)} />
            )}
          </dl>
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquareText aria-hidden="true" size={17} strokeWidth={2.2} className="text-[var(--muted)]" />
            <h2 className="text-xl font-bold text-[var(--heading)]">Detalle de gestión</h2>
          </div>
          <p className="text-sm text-[var(--muted)]">Historial cronológico de actualizaciones para dar claridad sobre el caso.</p>

          <div className="mt-4 space-y-3">
            {updates.length === 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/65 p-4 text-sm text-[var(--muted)]">
                Aun no hay actualizaciones de gestion para esta solicitud.
              </div>
            )}

            {updates.map((update, index) => (
              <div key={`${update.occurredAt}-${update.title}-${index}`} className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/65 p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-black text-[var(--accent-foreground)]">
                  {index + 1}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--heading)]">{update.title}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${updateTone(update.type)}`}>
                      {update.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{update.detail}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {formatDate(update.occurredAt)} · {update.actor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xl">
            <h3 id="delete-confirm-title" className="text-lg font-black text-[var(--heading)]">¿Eliminar solicitud?</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Esta acción no se puede deshacer. Se eliminará la solicitud {request.requestId} y su historial asociado.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <BrandButton type="button" variant="ghost" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancelar
              </BrandButton>
              <BrandButton type="button" variant="secondary" onClick={confirmDelete}>
                Sí, eliminar
              </BrandButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function updateTone(type: ManagementUpdate["type"]) {
  if (type === "FILED") {
    return "border-[var(--status-progress-border)] bg-[var(--status-progress-bg)] text-[var(--status-progress-text)]";
  }
  if (type === "IN_PROGRESS") {
    return "border-[var(--status-progress-border)] bg-[var(--status-progress-bg)] text-[var(--status-progress-text)]";
  }
  if (type === "RESPONDED" || type === "CLOSED") {
    return "border-[var(--status-active-border)] bg-[var(--status-active-bg)] text-[var(--status-active-text)]";
  }
  return "border-[var(--status-default-border)] bg-[var(--surface-2)] text-[var(--status-default-text)]";
}

function updateRank(type: ManagementUpdate["type"]) {
  switch (type) {
    case "FILED":
      return 0;
    case "CLASSIFIED":
      return 1;
    case "DISTRIBUTED":
      return 2;
    case "IN_ANALYSIS":
      return 3;
    case "DOCUMENTS_REQUESTED":
      return 4;
    case "IN_PROGRESS":
      return 5;
    case "RESPONDED":
      return 6;
    case "CLOSED":
      return 7;
    case "COMMENT":
    default:
      return 8;
  }
}

function LegendChip({ label, dotClass, chipClass }: { label: string; dotClass: string; chipClass: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${chipClass}`}>
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

function stageToIndex(stage: RequestSummary["journeyStage"]) {
  switch (stage) {
    case "FILED":
      return 0;
    case "CLASSIFIED":
      return 1;
    case "DISTRIBUTED":
      return 2;
    case "IN_ANALYSIS":
      return 3;
    case "REJECTED":
    case "RESPONDED":
      return 4;
    default:
      return 0;
  }
}

function TopMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white px-3 py-3">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-[var(--heading)]">{value}</p>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
      <dt className="inline-flex items-center gap-2 font-semibold text-[var(--text)]">
        {icon}
        {label}
      </dt>
      <dd className="text-right text-[var(--muted)]">{value}</dd>
    </div>
  );
}
