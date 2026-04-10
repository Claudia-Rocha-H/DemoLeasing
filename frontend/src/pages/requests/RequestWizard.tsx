import { type FormEvent, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { BrandButton } from "../../components/BrandButton";
import { useFileRequest } from "../../hooks/useFileRequest";
import { buildDescription, calculateEstimatedResolutionDate, getSlaPlan } from "../../utils/requestWorkflow";
import type { ContractCard, FileRequestPayload } from "../../models/requests";
import { WizardConfirmationStep } from "../../components/wizard/WizardConfirmationStep";
import { WizardInformationStep } from "../../components/wizard/WizardInformationStep";
import { WizardPanel } from "../../components/wizard/WizardPanel";
import { WizardSelectionStep } from "../../components/wizard/WizardSelectionStep";
import { WizardStepBar } from "../../components/wizard/WizardStepBar";
import { initialWizardState, requestTypeOptions, type WizardState, type WizardStep } from "../../models/wizardModel";

type RequestWizardProps = {
  contracts: ContractCard[];
  selectedContractId: string | null;
  onFiled: (requestId: string) => void;
};

export function RequestWizard({ contracts, selectedContractId, onFiled }: RequestWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [state, setState] = useState<WizardState>(initialWizardState);
  const [liveError, setLiveError] = useState<string | null>(null);
  const { mutate, isLoading, error, data } = useFileRequest();

  useEffect(() => {
    const selectedContract = contracts.find((contract) => contract.contractId === selectedContractId) ?? contracts[0];
    if (!selectedContract) {
      return;
    }

    setState((current) => ({
      ...current,
      contractId: selectedContract.contractId,
      customerId: selectedContract.customerId,
      operationNumber: selectedContract.operationNumber
    }));
  }, [contracts, selectedContractId]);

  useEffect(() => {
    const selectedContract = contracts.find((contract) => contract.contractId === state.contractId);
    if (!selectedContract) {
      return setLiveError(null);
    }

    if (state.operationNumber && state.operationNumber !== selectedContract.operationNumber) {
      setLiveError("El número de operación no coincide con el contrato seleccionado.");
      return;
    }

    if (state.customerId && state.customerId !== selectedContract.customerId) {
      setLiveError("El cliente no corresponde al contrato seleccionado.");
      return;
    }

    setLiveError(null);
  }, [contracts, state.contractId, state.customerId, state.operationNumber]);

  const selectedContract = contracts.find((contract) => contract.contractId === state.contractId) ?? null;
  const resolutionDate = calculateEstimatedResolutionDate(state.type);
  const totalDays = getSlaPlan(state.type).reduce((total, stepItem) => total + stepItem.businessDays, 0);

  const updateState = (patch: Partial<WizardState>) => {
    setState((current) => ({ ...current, ...patch }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (liveError || !selectedContract) {
      return;
    }

    const description = buildDescription([
      state.description,
      state.type === "CLAIM" && state.evidenceFiles.length > 0
        ? `Evidencia adjunta: ${state.evidenceFiles.map((file) => file.name).join(", ")}`
        : null
    ]);

    const payload: FileRequestPayload = {
      customerId: state.customerId,
      operationNumber: state.operationNumber,
      type: state.type,
      description
    };

    const filed = await mutate(payload);
    if (filed) {
      onFiled(filed.requestId);
      setStep(3);
    }
  };

  const currentSummary = [
    { label: "Contrato", value: selectedContract?.asset ?? "Sin contrato" },
    { label: "Operación", value: state.operationNumber || "Pendiente" },
    { label: "Tipo", value: requestTypeOptions.find((item) => item.value === state.type)?.title ?? state.type },
    { label: "ANS estimado", value: `${totalDays} días hábiles` }
  ];

  return (
    <section className="space-y-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Radicacion</p>
          <h1 className="text-3xl font-black tracking-tight text-[var(--heading)]">Formulario paso a paso</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            El flujo valida el contrato antes del envío y comunica el ANS estimado para que el cliente no espere en incertidumbre.
          </p>
        </div>

      </div>

      <WizardStepBar step={step} />

      <form className="space-y-6" onSubmit={onSubmit}>
        {step === 1 && (
            <WizardPanel title="Paso 1. Selección" description="Elige el contrato y el tipo de necesidad.">
              <WizardSelectionStep
                contracts={contracts}
                selectedContract={selectedContract}
                state={state}
                requestTypes={requestTypeOptions}
                updateState={updateState}
              />
            </WizardPanel>
          )}

        {step === 2 && (
            <WizardPanel title="Paso 2. Información" description="Incluye solo la información necesaria para evitar reprocesos.">
              <WizardInformationStep state={state} updateState={updateState} />
            </WizardPanel>
          )}

        {step === 3 && (
            <WizardPanel title="Paso 3. Confirmación de ANS" description="Antes de enviar, verifica el compromiso de atención.">
              <WizardConfirmationStep
                totalDays={totalDays}
                resolutionDate={resolutionDate}
                currentSummary={currentSummary}
              />
            </WizardPanel>
          )}

        {(liveError || error) && (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700" role="alert">
              {liveError || error}
            </div>
          )}

        {data && (
            <div className="rounded-2xl border border-green-300 bg-green-50 p-5 text-green-900 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-600 p-2 text-white">
                  <CheckCircle2 aria-hidden="true" size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-lg font-bold">Solicitud recibida</p>
                  <p className="mt-1 text-sm">Tu banco ya recibió tu necesidad. Número de radicado: {data.requestId}</p>
                </div>
              </div>
            </div>
          )}

        <div className="flex flex-wrap gap-3">
          {step > 1 && (
            <BrandButton type="button" variant="secondary" onClick={() => setStep((current) => (current - 1) as WizardStep)}>
              Volver
            </BrandButton>
          )}

          {step < 3 && (
            <BrandButton type="button" onClick={() => setStep((current) => (current + 1) as WizardStep)} disabled={Boolean(liveError)}>
              Continuar
            </BrandButton>
          )}

          {step === 3 && (
            <BrandButton type="submit" disabled={isLoading || Boolean(liveError)}>
              {isLoading ? "Enviando..." : "Enviar solicitud"}
            </BrandButton>
          )}
        </div>
      </form>
    </section>
  );
}
