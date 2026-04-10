import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, ClipboardCheck, FolderSearch, RefreshCw } from "lucide-react";
import { BrandButton } from "../../components/BrandButton";
import {
  classifyRequest,
  distributeRequest,
  fetchRequestSummaries,
  rejectRequest,
  registerOperationalUpdate
} from "../../lib/requestsApi";
import type { RequestSummary } from "../../models/requests";

const CUSTOMER_ID = "CUS-001";
const OPERATIVE_MEMBERS = ["Ana Gomez", "Carlos Rios", "Laura Pinto", "Miguel Vera"];

export function OperationalTeamPage() {
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [selectedOperative, setSelectedOperative] = useState(OPERATIVE_MEMBERS[0]);
  const [note, setNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRequest = useMemo(
    () => requests.find((item) => item.requestId === selectedRequestId) ?? requests[0] ?? null,
    [requests, selectedRequestId]
  );

  useEffect(() => {
    void refreshRequests();
  }, []);

  async function refreshRequests() {
    try {
      setError(null);
      setIsLoading(true);
      const data = await fetchRequestSummaries(CUSTOMER_ID);
      setRequests(data);
      setSelectedRequestId((current) => current || data[0]?.requestId || "");
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load operational requests.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function runAction(action: () => Promise<void>) {
    try {
      setError(null);
      setIsLoading(true);
      await action();
      await refreshRequests();
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : "Unable to process request action.";
      setError(message);
      setIsLoading(false);
    }
  }

  const canClassify = selectedRequest?.journeyStage === "FILED";
  const canDistribute = selectedRequest?.journeyStage === "CLASSIFIED";
  const canAnalyze = selectedRequest?.journeyStage === "DISTRIBUTED";
  const canRequestDocuments = selectedRequest?.journeyStage === "DISTRIBUTED" || selectedRequest?.journeyStage === "IN_ANALYSIS";
  const canReject = Boolean(selectedRequest) && selectedRequest?.status !== "REJECTED" && selectedRequest?.status !== "CLOSED";

  return (
    <main className="min-h-screen bg-[var(--page-bg)] py-6 lg:py-8">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 px-3 sm:px-6 lg:px-10">
        <section className="rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(145deg,var(--surface)_0%,var(--surface-2)_100%)] p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                <BriefcaseBusiness size={15} strokeWidth={2.2} aria-hidden="true" />
                Equipo Operativo
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--heading)]">Gestión operativa de solicitudes</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Vista interna para clasificar, distribuir y gestionar casos del cliente {CUSTOMER_ID}.
              </p>
            </div>
            <BrandButton type="button" variant="secondary" onClick={() => void refreshRequests()}>
              <RefreshCw size={16} strokeWidth={2.2} aria-hidden="true" />
              Actualizar
            </BrandButton>
          </div>
        </section>

        {error && (
          <section className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700" role="alert">
            {error}
          </section>
        )}

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Solicitudes del cliente</p>
            <div className="mt-4 space-y-2.5">
              {requests.map((request) => (
                <button
                  key={request.requestId}
                  type="button"
                  onClick={() => setSelectedRequestId(request.requestId)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selectedRequest?.requestId === request.requestId
                      ? "border-[var(--accent)] bg-[linear-gradient(135deg,var(--surface-2),white)] shadow-sm"
                      : "border-[var(--border)] bg-white hover:border-black/25 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-[var(--heading)]">{request.requestId} · {request.operationNumber}</p>
                    <span className="rounded-full border border-[var(--border)] bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                      {request.journeyStage}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">{request.title}</p>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:p-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              <ClipboardCheck size={15} strokeWidth={2.2} aria-hidden="true" />
              Acciones del operador
            </p>

            {!selectedRequest && (
              <p className="mt-4 text-sm text-[var(--muted)]">No hay solicitudes cargadas para gestionar.</p>
            )}

            {selectedRequest && (
              <div className="mt-5 space-y-5">
                <div className="rounded-2xl border border-[var(--border)] bg-[linear-gradient(140deg,var(--surface-2),white)] p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-[var(--heading)]">{selectedRequest.requestId}</p>
                    <span className="rounded-full border border-[var(--status-progress-border)] bg-[var(--status-progress-bg)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--status-progress-text)]">
                      {selectedRequest.journeyStage}
                    </span>
                  </div>
                  <p className="mt-2 text-[var(--muted)]">Solicitud: {selectedRequest.title}</p>
                </div>

                <section className="rounded-2xl border border-[var(--border)] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Flujo de atención</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <BrandButton
                      type="button"
                      onClick={() => void runAction(() => classifyRequest(selectedRequest.requestId, "Clasificación inicial completada"))}
                      disabled={!canClassify || isLoading}
                    >
                      Clasificar
                    </BrandButton>

                    <div className="space-y-2">
                      <select
                        value={selectedOperative}
                        onChange={(event) => setSelectedOperative(event.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                      >
                        {OPERATIVE_MEMBERS.map((member) => (
                          <option key={member} value={member}>{member}</option>
                        ))}
                      </select>
                      <BrandButton
                        type="button"
                        variant="secondary"
                        onClick={() => void runAction(() => distributeRequest(selectedRequest.requestId, selectedOperative))}
                        disabled={!canDistribute || isLoading}
                      >
                        Distribuir
                      </BrandButton>
                    </div>

                    <BrandButton
                      type="button"
                      variant="secondary"
                      onClick={() => void runAction(() =>
                        registerOperationalUpdate(
                          selectedRequest.requestId,
                          selectedOperative,
                          "START_ANALYSIS",
                          "Caso en analisis tecnico por el equipo operativo"
                        )
                      )}
                      disabled={!canAnalyze || isLoading}
                    >
                      Analizar
                    </BrandButton>

                    <BrandButton
                      type="button"
                      variant="secondary"
                      onClick={() => void runAction(() =>
                        registerOperationalUpdate(
                          selectedRequest.requestId,
                          selectedOperative,
                          "REQUEST_DOCUMENTS",
                          "Se solicitan documentos complementarios al cliente"
                        )
                      )}
                      disabled={!canRequestDocuments || isLoading}
                    >
                      Solicitar documentos
                    </BrandButton>
                  </div>
                </section>

                <section className="rounded-2xl border border-[var(--border)] bg-white p-4">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                    <FolderSearch size={14} strokeWidth={2.2} aria-hidden="true" />
                    Nota interna
                  </p>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                    placeholder="Registrar actualización operativa"
                  />
                  <div className="mt-3 flex justify-end">
                    <BrandButton
                      type="button"
                      variant="ghost"
                      onClick={() => void runAction(() =>
                        registerOperationalUpdate(
                          selectedRequest.requestId,
                          selectedOperative,
                          "ADD_NOTE",
                          note || "Seguimiento interno sin novedad"
                        )
                      )}
                      disabled={isLoading}
                    >
                      Guardar nota
                    </BrandButton>
                  </div>
                </section>

                <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Gestión de riesgo</p>
                  <p className="mt-1 text-sm text-red-800">Usa esta acción cuando la solicitud no cumple los criterios definidos.</p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setIsRejectModalOpen(true)}
                      disabled={!canReject || isLoading}
                      className="inline-flex w-full items-center justify-center rounded-xl border border-red-300 bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Rechazar solicitud
                    </button>
                  </div>
                </section>
              </div>
            )}
          </article>
        </section>

        {isRejectModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true" aria-labelledby="reject-request-title">
            <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-5 shadow-xl">
              <h3 id="reject-request-title" className="text-lg font-black text-[var(--heading)]">Rechazar solicitud</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Indica el motivo de rechazo para la solicitud {selectedRequest.requestId}. El cliente verá esta razón en el seguimiento.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                rows={4}
                className="mt-4 w-full rounded-xl border border-red-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                placeholder="Motivo del rechazo"
              />
              <div className="mt-5 flex justify-end gap-3">
                <BrandButton type="button" variant="ghost" onClick={() => setIsRejectModalOpen(false)}>
                  Cancelar
                </BrandButton>
                <button
                  type="button"
                  disabled={isLoading || !rejectionReason.trim()}
                  className="inline-flex items-center justify-center rounded-xl border border-red-300 bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    const reason = rejectionReason.trim();
                    if (!reason || !selectedRequest) {
                      return;
                    }

                    setIsRejectModalOpen(false);
                    setRejectionReason("");
                    void runAction(() => rejectRequest(selectedRequest.requestId, reason, selectedOperative));
                  }}
                >
                  Confirmar rechazo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
