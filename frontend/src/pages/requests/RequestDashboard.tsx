import { useMemo, useState } from "react";
import { BarChart3, ChevronLeft, ChevronRight, Clock3, CreditCard, FileText } from "lucide-react";
import { BrandButton } from "../../components/BrandButton";
import { formatDate } from "../../utils/formatDate";
import type { ContractCard, RequestSummary } from "../../models/requests";

type RequestDashboardProps = {
  contracts: ContractCard[];
  requests: RequestSummary[];
  onNewRequest: (contractId: string) => void;
  onTrackRequest: (requestId: string) => void;
};

export function RequestDashboard({ contracts, requests, onNewRequest, onTrackRequest }: RequestDashboardProps) {
  const visibleCards = 3;
  const [contractsStartIndex, setContractsStartIndex] = useState(0);
  const maxContractsStart = Math.max(contracts.length - visibleCards, 0);
  const visibleContracts = useMemo(
    () => contracts.slice(contractsStartIndex, contractsStartIndex + visibleCards),
    [contracts, contractsStartIndex]
  );

  const moveContracts = (direction: "prev" | "next") => {
    setContractsStartIndex((current) => {
      if (direction === "prev") {
        return Math.max(current - 1, 0);
      }
      return Math.min(current + 1, maxContractsStart);
    });
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--surface)_0%,var(--surface-2)_100%)] p-6 shadow-sm lg:p-9">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1">
              <BarChart3 aria-hidden="true" size={16} strokeWidth={2.2} />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">Vista general de contratos</p>
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--heading)] sm:text-4xl">Tu leasing, claro desde el primer vistazo</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              Aquí ves qué tienes con el banco, el estado de cada contrato y las solicitudes más recientes para reducir incertidumbre y reprocesos.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Resumen</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <Stat label="Contratos" value={contracts.length.toString()} />
              <Stat label="Solicitudes" value={requests.length.toString()} />
              <Stat label="En curso" value={requests.filter((item) => item.status === "IN_PROGRESS").length.toString()} />
            </div>
            <BrandButton fullWidth type="button" onClick={() => onNewRequest(contracts[0]?.contractId ?? "") }>
              Nueva Solicitud
            </BrandButton>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1">
              <FileText aria-hidden="true" size={16} strokeWidth={2.2} />
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Resumen de contratos</p>
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[var(--heading)]">Tus operaciones activas</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Selecciona una operación para radicar la solicitud.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <button
            type="button"
            onClick={() => moveContracts("prev")}
            disabled={contractsStartIndex === 0}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--heading)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Desplazar contratos a la izquierda"
          >
            <ChevronLeft aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>

          <div className="grid flex-1 gap-4 lg:grid-cols-3">
          {visibleContracts.map((contract, index) => (
            <article
              key={contract.contractId}
              className="overflow-hidden rounded-2xl border border-black/15 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="p-5"
                style={{
                  background: `linear-gradient(160deg, color-mix(in srgb, var(--card-pastel-${((contractsStartIndex + index) % 4) + 1}) 78%, white 22%) 0%, var(--card-pastel-${((contractsStartIndex + index) % 4) + 1}) 100%)`
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white/90 text-[var(--heading)] shadow-sm">
                      <CreditCard aria-hidden="true" size={17} strokeWidth={2.5} />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/80">Operación</p>
                    <h3 className="mt-1 text-lg font-bold">{contract.operationNumber}</h3>
                  </div>
                  <StatusChip status={contract.status} />
                </div>

                <p className="mt-4 text-sm font-medium text-black/80">Activo</p>
                <p className="text-base font-semibold">{contract.asset}</p>
              </div>

              <div className="space-y-4 bg-white p-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-[var(--muted)]">
                    <span>Estado de gestión</span>
                    <span className="font-semibold text-[var(--text)]">{contract.progress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
                      style={{ width: `${contract.progress}%`, backgroundColor: getProgressColor() }}
                    />
                  </div>
                </div>

                <p className="text-sm text-[var(--muted)]">Siguiente hito: {contract.nextMilestone}</p>

                <div className="grid gap-2 sm:grid-cols-2">
                  <BrandButton type="button" onClick={() => onNewRequest(contract.contractId)}>
                    Nueva Solicitud
                  </BrandButton>
                  <BrandButton type="button" variant="secondary" onClick={() => {
                    const request = requests.find((item) => item.contractId === contract.contractId);
                    if (request) {
                      onTrackRequest(request.requestId);
                    }
                  }}>
                    Ver Tracking
                  </BrandButton>
                </div>
              </div>
            </article>
          ))}
          </div>

          <button
            type="button"
            onClick={() => moveContracts("next")}
            disabled={contractsStartIndex >= maxContractsStart}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--heading)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Desplazar contratos a la derecha"
          >
            <ChevronRight aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>
        </div>

        {contracts.length > visibleCards && (
          <p className="mt-3 text-xs font-medium text-[var(--muted)]">
            Mostrando {contractsStartIndex + 1} a {Math.min(contractsStartIndex + visibleCards, contracts.length)} de {contracts.length} contratos
          </p>
        )}
      </section>

      <section>
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1">
                <Clock3 aria-hidden="true" size={16} strokeWidth={2.2} />
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Solicitudes recientes</p>
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-[var(--heading)]">Últimos movimientos</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Los movimientos de radicación con estado y avance visibles.</p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/70 p-2">
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  <th className="px-4 py-2">Solicitud</th>
                  <th className="px-4 py-2">Contrato</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Progreso</th>
                  <th className="px-4 py-2 text-right">Seguimiento</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.requestId} className="align-middle transition hover:-translate-y-0.5">
                    <td className="rounded-l-xl border-y border-l border-black/10 bg-white px-4 py-4">
                      <p className="font-semibold">{request.title}</p>
                      <p className="text-xs text-[var(--muted)]">{request.requestId} · {request.type}</p>
                      {request.status === "REJECTED" && request.responseNote && (
                        <p className="mt-1 text-xs font-medium text-red-700">Motivo: {request.responseNote}</p>
                      )}
                    </td>
                    <td className="border-y border-black/10 bg-white px-4 py-4 font-medium text-[var(--muted)]">{request.operationNumber}</td>
                    <td className="border-y border-black/10 bg-white px-4 py-4"><StatusChip status={request.status} /></td>
                    <td className="w-56 border-y border-black/10 bg-white px-4 py-4">
                      <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
                        <span>{request.progress}%</span>
                        <span>{formatDate(request.filedAt)}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${request.progress}%` }} />
                      </div>
                    </td>
                    <td className="rounded-r-xl border-y border-r border-black/10 bg-white px-4 py-4 text-right">
                      <BrandButton type="button" variant="ghost" onClick={() => onTrackRequest(request.requestId)}>
                        Abrir
                      </BrandButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--surface-2)] px-3 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const tone = getStatusTone(status);

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide"
      style={{ color: tone.text, borderColor: tone.border }}
    >
      <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: tone.dot }} />
      {tone.label}
    </span>
  );
}

function getStatusTone(status: string) {
  if (status === "REJECTED") {
    return {
      label: "Rechazada",
      text: "var(--status-claim-text)",
      dot: "var(--status-claim-dot)",
      border: "var(--status-claim-border)"
    };
  }

  if (status === "ACTIVE") {
    return {
      label: "Activo",
      text: "var(--status-active-text)",
      dot: "var(--status-active-dot)",
      border: "var(--status-active-border)"
    };
  }

  if (status === "IN_SINIESTRO") {
    return {
      label: "En siniestro",
      text: "var(--status-claim-text)",
      dot: "var(--status-claim-dot)",
      border: "var(--status-claim-border)"
    };
  }

  if (status === "IN_PROGRESS") {
    return {
      label: "En curso",
      text: "var(--status-progress-text)",
      dot: "var(--status-progress-dot)",
      border: "var(--status-progress-border)"
    };
  }

  if (status === "CLOSED") {
    return {
      label: "Closed",
      text: "var(--status-default-text)",
      dot: "var(--status-default-dot)",
      border: "var(--status-default-border)"
    };
  }

  return {
    label: status.replace(/_/g, " "),
    text: "var(--status-default-text)",
    dot: "var(--status-default-dot)",
    border: "var(--status-default-border)"
  };
}

function getProgressColor() {
  return "#d4af0f";
}
