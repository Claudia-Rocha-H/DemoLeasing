import { type ReactNode, useState } from "react";
import { Contrast, Palette, RotateCcw, Settings2, Type, X } from "lucide-react";
import type { AccessibilitySettings, ColorVisionMode, TextScale } from "../hooks/useAccessibilityPreferences";

type AccessibilityToolbarProps = {
  settings: AccessibilitySettings;
  onTextScaleChange: (value: TextScale) => void;
  onToggleHighContrast: () => void;
  onColorVisionModeChange: (value: ColorVisionMode) => void;
  onReset: () => void;
};

export function AccessibilityToolbar({
  settings,
  onTextScaleChange,
  onToggleHighContrast,
  onColorVisionModeChange,
  onReset
}: AccessibilityToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open accessibility menu"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-5 right-5 z-[140] flex h-14 w-14 items-center justify-center rounded-full border-4 border-[var(--accent)] bg-[var(--surface)] text-[var(--text)] shadow-lg transition hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <Settings2 aria-hidden="true" size={24} strokeWidth={2.1} />
      </button>

      {isOpen && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
            className="fixed -inset-8 z-[120] bg-black/30 backdrop-blur-[4px]"
          />

          <section className="fixed inset-x-3 bottom-24 top-20 z-[130] flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:inset-x-auto sm:right-4 sm:top-16 sm:w-[min(92vw,450px)] sm:max-h-[calc(100vh-6.5rem)]">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-2)]/80 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Accesibilidad</p>
                <h2 className="text-lg font-bold">Ajustes globales de lectura</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Tipografia, contraste y modos por tipo de daltonismo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close accessibility menu"
                className="rounded-full border border-[var(--border)] bg-white p-1.5 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--surface-2)] hover:shadow"
              >
                <X aria-hidden="true" size={14} strokeWidth={2.3} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5">
              <div className="space-y-4">
              <SectionBlock
                icon={<Type size={16} strokeWidth={2.2} aria-hidden="true" />}
                title="Tamano de letra"
                description="Ajusta el tamano general para mejorar lectura."
              >
                <ToggleGroup
                  label="Escala"
                  value={settings.textScale}
                  items={[
                    { label: "Normal", value: "normal" },
                    { label: "Grande", value: "large" },
                    { label: "Muy grande", value: "xlarge" }
                  ]}
                  onChange={onTextScaleChange}
                />
              </SectionBlock>

              <SectionBlock
                icon={<Contrast size={16} strokeWidth={2.2} aria-hidden="true" />}
                title="Contraste"
                description="Refuerza contornos, textos y fondos para legibilidad."
              >
                <ActionToggle
                  label="Alto contraste"
                  description="Activa una paleta de alto contraste para lectura exigente."
                  active={settings.highContrast}
                  onClick={onToggleHighContrast}
                />
              </SectionBlock>

              <SectionBlock
                icon={<Palette size={16} strokeWidth={2.2} aria-hidden="true" />}
                title="Vision de color"
                description="Selecciona el modo que mejor se adapte a tu percepcion."
              >
                <ToggleGroup
                  label="Modo"
                  value={settings.colorVisionMode}
                  items={[
                    { label: "Normal", value: "normal" },
                    { label: "Deuteranopia", value: "deuteranopia" },
                    { label: "Protanopia", value: "protanopia" },
                    { label: "Tritanopia", value: "tritanopia" },
                    { label: "Acromatopsia", value: "achromatopsia" }
                  ]}
                  onChange={onColorVisionModeChange}
                />
              </SectionBlock>

              <div className="border-t border-[var(--border)] pt-3">
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d1b100] bg-[#fff7cc] px-4 py-2.5 text-sm font-semibold text-[#624a00] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ffef99] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <RotateCcw aria-hidden="true" size={15} strokeWidth={2.4} />
                  Restablecer ajustes
                </button>
              </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}

type ToggleGroupProps<T extends string> = {
  label: string;
  value: T;
  items: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
};

function ToggleGroup<T extends string>({ label, value, items, onChange }: ToggleGroupProps<T>) {
  return (
    <fieldset className="rounded-xl border border-[var(--border)] bg-white p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={value === item.value}
            onClick={() => onChange(item.value)}
            className={`min-h-10 rounded-full border px-3 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              value === item.value
                ? "border-transparent bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_6px_16px_rgba(251,191,36,0.28)]"
                : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:-translate-y-0.5 hover:border-black/20 hover:bg-white hover:shadow-sm"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

type ActionToggleProps = {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
};

function ActionToggle({ label, description, active, onClick }: ActionToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
        active
          ? "border-transparent bg-[var(--accent)]/18 shadow-sm"
          : "border-[var(--border)] bg-[var(--surface)] hover:-translate-y-0.5 hover:border-black/20 hover:bg-[var(--surface-2)] hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        <span className="rounded-full border border-[var(--border)] bg-white px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">
          {active ? "Activo" : "Inactivo"}
        </span>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
    </button>
  );
}

type SectionBlockProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function SectionBlock({ icon, title, description, children }: SectionBlockProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/55 p-3.5">
      <div className="mb-3 flex items-start gap-2.5 border-b border-[var(--border)] pb-3">
        <div className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--text)]">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--heading)]">{title}</h3>
          <p className="text-xs text-[var(--muted)]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
