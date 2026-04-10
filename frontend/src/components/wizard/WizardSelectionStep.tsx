import { WizardField } from "./WizardField";
import type { ContractCard, RequestType } from "../../models/requests";
import type { WizardState } from "../../models/wizardModel";

type WizardSelectionStepProps = {
  contracts: ContractCard[];
  selectedContract: ContractCard | null;
  state: WizardState;
  requestTypes: Array<{ value: RequestType; title: string; description: string }>;
  updateState: (patch: Partial<WizardState>) => void;
};

export function WizardSelectionStep({
  contracts,
  selectedContract,
  state,
  requestTypes,
  updateState
}: WizardSelectionStepProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <WizardField label="Contrato" htmlFor="contractId" hint="Puedes cambiarlo desde el dashboard o aqui mismo.">
          <select
            id="contractId"
            className="input-shell"
            value={state.contractId}
            onChange={(event) => {
              const contract = contracts.find((item) => item.contractId === event.target.value);
              if (contract) {
                updateState({
                  contractId: contract.contractId,
                  customerId: contract.customerId,
                  operationNumber: contract.operationNumber
                });
              }
            }}
          >
            {contracts.map((contract) => (
              <option key={contract.contractId} value={contract.contractId}>
                {contract.operationNumber} - {contract.asset}
              </option>
            ))}
          </select>
        </WizardField>

        <WizardField label="Numero de operacion" htmlFor="operationNumber" hint="Asignado automaticamente segun contrato.">
          <input
            id="operationNumber"
            className="input-shell"
            value={state.operationNumber}
            readOnly
          />
        </WizardField>

        <WizardField label="Cliente" htmlFor="customerId" hint="Asignado automaticamente segun contrato.">
          <input
            id="customerId"
            className="input-shell"
            value={state.customerId}
            readOnly
          />
        </WizardField>

        <WizardField label="Necesidad" htmlFor="type">
          <select
            id="type"
            className="input-shell"
            value={state.type}
            onChange={(event) => updateState({ type: event.target.value as RequestType })}
          >
            {requestTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.title}
              </option>
            ))}
          </select>
        </WizardField>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Contrato activo</p>
        <p className="mt-1 text-sm font-semibold text-[var(--heading)]">
          {selectedContract
            ? `${selectedContract.operationNumber} - ${selectedContract.asset} - ${selectedContract.status}`
            : "Selecciona un contrato para continuar."}
        </p>
      </div>
    </>
  );
}
