import { WizardPanel } from "./WizardPanel";
import type { SlaStep } from "../../utils/requestWorkflow";

type WizardSidebarProps = {
  slaPlan: SlaStep[];
  totalDays: number;
};

export function WizardSidebar({ slaPlan, totalDays }: WizardSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <WizardPanel title="Accesibilidad y claridad" description="Pensado para lectura rapida y confirmacion inmediata.">
        <ul className="space-y-3 text-sm text-[var(--muted)]">
          <li>- Tipografia escalable desde la barra superior.</li>
          <li>- Alto contraste para lectura en pantallas y luz baja.</li>
          <li>- Modo daltonico con acentos alternos y estados reforzados.</li>
          <li>- Validacion en vivo antes del envio.</li>
        </ul>
      </WizardPanel>

      <WizardPanel title="SLA granular" description="Distribucion por estado de atencion.">
        <div className="space-y-3">
          {slaPlan.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] px-3 py-3 text-sm">
              <span className="font-semibold">{item.label}</span>
              <span className="text-[var(--muted)]">{item.businessDays} dia(s)</span>
            </div>
          ))}
        </div>
      </WizardPanel>

      <WizardPanel title="Mensaje transparente" description="Lo que ve el cliente antes de enviar.">
        <p className="text-sm text-[var(--muted)]">
          Tu solicitud sera atendida en un maximo de {totalDays} dias habiles. La fecha estimada se actualiza segun la tipologia y el estado del caso.
        </p>
      </WizardPanel>
    </aside>
  );
}
