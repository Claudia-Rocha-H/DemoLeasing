import { CalendarClock, CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react";
import { formatDate } from "../../utils/formatDate";

type WizardConfirmationStepProps = {
  totalDays: number;
  resolutionDate: Date;
  currentSummary: Array<{ label: string; value: string }>;
};

export function WizardConfirmationStep({ totalDays, resolutionDate, currentSummary }: WizardConfirmationStepProps) {
  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-[#e6c200] bg-[linear-gradient(160deg,#fffbe6_0%,#fff4bf_100%)] p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              <ShieldCheck aria-hidden="true" size={14} strokeWidth={2.2} />
              Compromiso de atención
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--muted)]">Tiempo estimado de respuesta</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-[var(--heading)]">{totalDays} días hábiles</p>
          </div>

          <div className="min-w-[220px] rounded-xl border border-black/10 bg-white/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Fecha estimada</p>
            <p className="mt-2 inline-flex items-center gap-2 text-base font-bold text-[var(--text)]">
              <CalendarClock aria-hidden="true" size={16} strokeWidth={2.2} />
              {formatDate(resolutionDate)}
            </p>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-3">
          <ClipboardList aria-hidden="true" size={17} strokeWidth={2.2} className="text-[var(--muted)]" />
          <h3 className="text-lg font-bold tracking-tight text-[var(--heading)]">Resumen de radicación</h3>
        </div>

        <div className="grid gap-2">
          {currentSummary.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl bg-[var(--surface-2)] px-4 py-3">
              <p className="text-sm font-medium text-[var(--muted)]">{item.label}</p>
              <p className="text-sm font-bold text-[var(--text)]">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 aria-hidden="true" size={16} strokeWidth={2.4} className="mt-0.5" />
          <p>Verifica estos datos antes de enviar para evitar reprocesos y acelerar la respuesta.</p>
        </div>
      </article>
    </div>
  );
}
