import { type ReactNode, useEffect, useMemo, useState } from "react";
import { ChevronDown, CircleHelp, Search, UserRound } from "lucide-react";
import { deleteRequest, fetchContracts, fetchRequestSummaries } from "../../lib/requestsApi";
import {
  deleteNotification,
  fetchNotificationEmailPreference,
  fetchNotifications,
  openNotification,
  updateNotificationEmailPreference
} from "../../lib/notificationsApi";
import { AccessibilityToolbar } from "../../components/AccessibilityToolbar";
import { NotificationBell } from "../../components/common/NotificationBell";
import { RequestDashboard } from "./RequestDashboard";
import { RequestStatusTracker } from "./RequestStatusTracker";
import { RequestWizard } from "./RequestWizard";
import { useAccessibilityPreferences } from "../../hooks/useAccessibilityPreferences";
import type { ContractCard, RequestSummary } from "../../models/requests";
import type { CustomerNotification } from "../../models/notifications";

type ViewMode = "dashboard" | "wizard" | "tracking";
const CUSTOMER_ID = "CUS-001";

export function LeasingPortal() {
  const [view, setView] = useState<ViewMode>("dashboard");
  const [contracts, setContracts] = useState<ContractCard[]>([]);
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isDeletingRequest, setIsDeletingRequest] = useState(false);
  const { settings, setTextScale, setColorVisionMode, toggleHighContrast, reset } = useAccessibilityPreferences();

  useEffect(() => {
    void Promise.all([loadPortalData(), loadNotificationCenter()]).catch(() => {
      // Errors are already handled inside loaders.
    });

    const polling = window.setInterval(() => {
      void loadNotificationCenter();
    }, 20000);

    return () => window.clearInterval(polling);
  }, []);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.requestId === selectedRequestId) ?? requests[0],
    [requests, selectedRequestId]
  );

  async function loadPortalData() {
    try {
      setLoadingError(null);
      const [contractsData, requestsData] = await Promise.all([fetchContracts(), fetchRequestSummaries()]);
      setContracts(contractsData);
      setRequests(requestsData);
      setSelectedContractId((current) => current ?? contractsData[0]?.contractId ?? null);
      setSelectedRequestId((current) => current ?? requestsData[0]?.requestId ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load portal data.";
      setLoadingError(message);
    }
  }

  async function loadNotificationCenter() {
    try {
      setIsUpdatingNotifications(true);
      const [notificationsData, preferenceData] = await Promise.all([
        fetchNotifications(CUSTOMER_ID),
        fetchNotificationEmailPreference(CUSTOMER_ID)
      ]);
      setNotifications(notificationsData);
      setEmailNotificationsEnabled(preferenceData.emailEnabled);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load notifications.";
      setLoadingError(message);
    } finally {
      setIsUpdatingNotifications(false);
    }
  }

  async function handleOpenNotification(notification: CustomerNotification) {
    try {
      await openNotification(notification.notificationId, CUSTOMER_ID);
      setSelectedRequestId(notification.requestId);
      setView("tracking");
      await Promise.all([loadPortalData(), loadNotificationCenter()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to open notification.";
      setLoadingError(message);
    }
  }

  async function handleDeleteNotification(notificationId: number) {
    try {
      await deleteNotification(notificationId, CUSTOMER_ID);
      await loadNotificationCenter();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete notification.";
      setLoadingError(message);
    }
  }

  async function handleToggleEmailNotifications(emailEnabled: boolean) {
    try {
      setEmailNotificationsEnabled(emailEnabled);
      const preference = await updateNotificationEmailPreference(CUSTOMER_ID, emailEnabled);
      setEmailNotificationsEnabled(preference.emailEnabled);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update email notification preference.";
      setLoadingError(message);
    }
  }

  const currentDateLabel = useMemo(
    () => new Date().toLocaleString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }),
    []
  );

  const onNewRequest = (contractId: string) => {
    setSelectedContractId(contractId || (contracts[0]?.contractId ?? null));
    setView("wizard");
  };

  const onFiled = (requestId: string) => {
    const contract = contracts.find((item) => item.contractId === selectedContractId) ?? contracts[0];
    if (!contract) {
      return;
    }

    const newRequest: RequestSummary = {
      requestId,
      contractId: contract.contractId,
      customerId: contract.customerId,
      operationNumber: contract.operationNumber,
      type: "CERTIFICATE",
      title: "Solicitud radicada",
      status: "IN_PROGRESS",
      journeyStage: "FILED",
      progress: 20,
      filedAt: new Date().toISOString(),
      estimatedResolutionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      responseNote: null,
      managementUpdates: [
        {
          type: "FILED",
          title: "Radicada",
          detail: "La solicitud fue recibida por el sistema",
          occurredAt: new Date().toISOString(),
          actor: "system"
        }
      ]
    };

    setRequests((current) => [newRequest, ...current].slice(0, 10));
    setSelectedRequestId(requestId);
    setView("tracking");
    void loadPortalData().catch(() => {
      // Errors are already handled inside loadPortalData.
    });
  };

  const onTrackRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setView("tracking");
  };

  const onDeleteRequest = async (requestId: string) => {
    try {
      setIsDeletingRequest(true);
      await deleteRequest(requestId);
      setSelectedRequestId(null);
      await loadPortalData();
      setView("dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete request.";
      setLoadingError(message);
    } finally {
      setIsDeletingRequest(false);
    }
  };

  const canDeleteSelectedRequest = Boolean(
    selectedRequest
      && selectedRequest.status !== "CLOSED"
      && (selectedRequest.journeyStage === "FILED" || selectedRequest.journeyStage === "CLASSIFIED")
  );

  return (
    <div className="space-y-6 pb-24 pt-52 lg:pt-40">
      <header className="fixed left-0 right-0 top-0 z-40 overflow-hidden border-b border-black/20 shadow-sm">
        <div className="border-b-2 border-[var(--accent)] bg-[#1e1e22] text-white">
          <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-sm font-black text-black">B</div>
                <p className="text-3xl font-black leading-none tracking-tight">Bancolombia</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <NotificationBell
                notifications={notifications}
                emailEnabled={emailNotificationsEnabled}
                isLoading={isUpdatingNotifications}
                onRefresh={() => {
                  void loadNotificationCenter();
                }}
                onOpenNotification={(notification) => {
                  void handleOpenNotification(notification);
                }}
                onDeleteNotification={(notificationId) => {
                  void handleDeleteNotification(notificationId);
                }}
                onToggleEmail={(emailEnabled) => {
                  void handleToggleEmailNotifications(emailEnabled);
                }}
              />
              <button type="button" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/10">
                <Search size={17} strokeWidth={2.2} aria-hidden="true" />
                Buscar
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/10">
                <CircleHelp size={17} strokeWidth={2.2} aria-hidden="true" />
                Ayuda
                <ChevronDown size={15} strokeWidth={2.2} aria-hidden="true" />
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm transition hover:bg-white/10">
                <UserRound size={16} strokeWidth={2.2} aria-hidden="true" />
                Usuario
                <ChevronDown size={15} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface)] px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">Bancolombia Leasing</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight">Gestión de solicitudes</h1>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <p className="text-xs font-medium capitalize text-[var(--muted)]">{currentDateLabel}</p>
              <div className="flex flex-wrap gap-2">
                <NavButton active={view === "dashboard"} onClick={() => setView("dashboard")}>Dashboard</NavButton>
                <NavButton active={view === "wizard"} onClick={() => setView("wizard")}>Nueva solicitud</NavButton>
                <NavButton active={view === "tracking"} onClick={() => setView("tracking")}>Seguimiento</NavButton>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AccessibilityToolbar
        settings={settings}
        onTextScaleChange={setTextScale}
        onToggleHighContrast={toggleHighContrast}
        onColorVisionModeChange={setColorVisionMode}
        onReset={reset}
      />

      {loadingError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700" role="alert">
          {loadingError}
        </div>
      )}

      {view === "dashboard" && (
        <RequestDashboard
          contracts={contracts}
          requests={requests}
          onNewRequest={onNewRequest}
          onTrackRequest={onTrackRequest}
        />
      )}

      {view === "wizard" && (
        <RequestWizard
          contracts={contracts}
          selectedContractId={selectedContractId}
          onFiled={onFiled}
        />
      )}

      {view === "tracking" && selectedRequest && (
        <RequestStatusTracker
          requests={requests}
          request={selectedRequest}
          onSelectRequest={setSelectedRequestId}
          canDeleteRequest={canDeleteSelectedRequest}
          isDeletingRequest={isDeletingRequest}
          onDeleteRequest={onDeleteRequest}
        />
      )}
    </div>
  );
}

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
        active
          ? "border-transparent bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_8px_20px_rgba(251,191,36,0.32)]"
          : "border-[var(--border)] bg-white text-[var(--text)] hover:-translate-y-0.5 hover:border-black/25 hover:bg-[var(--surface-2)] hover:shadow-sm"
      }`}
    >
      {children}
    </button>
  );
}
