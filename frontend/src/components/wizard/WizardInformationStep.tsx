import { useRef, useState } from "react";
import { FileUp, ImagePlus, Paperclip, X } from "lucide-react";
import { WizardField } from "./WizardField";
import type { WizardState } from "../../models/wizardModel";

type WizardInformationStepProps = {
  state: WizardState;
  updateState: (patch: Partial<WizardState>) => void;
};

export function WizardInformationStep({ state, updateState }: WizardInformationStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const accepted = ["image/png", "image/jpeg", "application/pdf"];

  const mergeFiles = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    const next = Array.from(fileList).filter((file) => accepted.includes(file.type));
    const merged = [...state.evidenceFiles, ...next];
    const deduped = merged.filter((file, index, arr) => arr.findIndex((item) => item.name === file.name && item.size === file.size) === index);
    updateState({ evidenceFiles: deduped });
  };

  const removeFile = (target: File) => {
    updateState({ evidenceFiles: state.evidenceFiles.filter((file) => !(file.name === target.name && file.size === target.size)) });
  };

  return (
    <div className="space-y-4">
      <WizardField label="Descripcion" htmlFor="description" hint="Cuentanos que necesitas en lenguaje simple y directo.">
        <textarea
          id="description"
          className="input-shell min-h-40"
          value={state.description}
          onChange={(event) => updateState({ description: event.target.value })}
          placeholder="Ejemplo: Solicito certificado de estado de cuenta del contrato para tramite interno."
        />
      </WizardField>

      {state.type === "CLAIM" && (
        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="flex items-start gap-2">
            <ImagePlus aria-hidden="true" size={17} strokeWidth={2.2} className="mt-0.5 text-[var(--muted)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--heading)]">Soportes del siniestro</p>
              <p className="text-sm text-[var(--muted)]">Arrastra archivos o haz clic para subir evidencia. Formatos permitidos: PNG, JPG, PDF.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              mergeFiles(event.dataTransfer.files);
            }}
            className={`w-full rounded-2xl border-2 border-dashed px-6 py-8 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              isDragging
                ? "border-emerald-500 bg-emerald-100/65"
                : "border-slate-400 bg-white hover:border-sky-400 hover:bg-slate-50"
            }`}
          >
            <div className="flex min-h-28 flex-col items-center justify-center gap-2 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500">
                <FileUp aria-hidden="true" size={20} strokeWidth={2.2} />
              </div>
              <p className="text-lg font-medium text-slate-600">Arrastra y suelta archivos aquí</p>
              <p className="text-sm text-slate-400">o</p>
              <span className="inline-flex rounded border border-cyan-400 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                Explorar archivos
              </span>
            </div>
          </button>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".png,.jpg,.jpeg,.pdf"
            multiple
            onChange={(event) => mergeFiles(event.target.files)}
          />

          {state.evidenceFiles.length > 0 && (
            <div className="space-y-2 rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Archivos seleccionados</p>
              {state.evidenceFiles.map((file) => (
                <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm">
                  <span className="inline-flex items-center gap-2 text-[var(--text)]">
                    <Paperclip aria-hidden="true" size={14} strokeWidth={2.3} />
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(file)}
                    className="rounded-full border border-[var(--border)] bg-white p-1 text-[var(--muted)] transition hover:bg-red-50 hover:text-red-700"
                    aria-label={`Remover ${file.name}`}
                  >
                    <X aria-hidden="true" size={13} strokeWidth={2.4} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
