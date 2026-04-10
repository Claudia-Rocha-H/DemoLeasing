import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Mail, Trash2 } from "lucide-react";
import type { CustomerNotification } from "../../models/notifications";

type NotificationBellProps = {
  notifications: CustomerNotification[];
  emailEnabled: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenNotification: (notification: CustomerNotification) => void;
  onDeleteNotification: (notificationId: number) => void;
  onToggleEmail: (emailEnabled: boolean) => void;
};

export function NotificationBell({
  notifications,
  emailEnabled,
  isLoading,
  onRefresh,
  onOpenNotification,
  onDeleteNotification,
  onToggleEmail
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/10"
        aria-label="Open notifications"
      >
        <Bell size={17} strokeWidth={2.2} aria-hidden="true" />
        Notifications
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-black text-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section 
          ref={(el) => {
            if (el && wrapperRef.current) {
              const rect = wrapperRef.current.getBoundingClientRect();
              el.style.top = `${rect.bottom + 8}px`;
              el.style.right = `${window.innerWidth - rect.right}px`;
            }
          }}
          className="fixed z-50 w-[360px] max-w-[calc(100vw-16px)] rounded-2xl border border-[var(--border)] bg-white p-4 text-[var(--text)] shadow-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black uppercase tracking-[0.15em] text-[var(--heading)]">Notificaciones</p>
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-semibold hover:bg-[var(--surface-2)]"
            >
              Actualizar
            </button>
          </div>

          <label className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(event) => onToggleEmail(event.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            <Mail size={14} aria-hidden="true" />
            Notificarme por correo
          </label>

          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            {notifications.length === 0 && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--muted)]">
                Sin notificaciones.
              </div>
            )}

            {notifications.map((notification) => (
              <article
                key={notification.notificationId}
                className={`rounded-xl border p-3 ${
                  notification.read
                    ? "border-[var(--border)] bg-[var(--surface-2)]"
                    : "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_18%,white)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[var(--heading)]">{notification.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{new Date(notification.createdAt).toLocaleString("en-US")}</p>
                  </div>
                  {!notification.read && (
                    <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-black">
                      Nuevo
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-[var(--text)]">{notification.message}</p>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onDeleteNotification(notification.notificationId)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    Eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenNotification(notification)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold hover:bg-[var(--surface)]"
                  >
                    <CheckCheck size={13} aria-hidden="true" />
                    Abrir
                  </button>
                </div>
              </article>
            ))}
          </div>

          {isLoading && <p className="mt-3 text-xs text-[var(--muted)]">Actualizando notificaciones...</p>}
        </section>
      )}
    </div>
  );
}
