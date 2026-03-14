import type { MissionScenario } from "../../../types/scenario";
import DetailSection from "./DetailSection";

type ScenariosTabProps = {
  scenario: MissionScenario;
};

function ScenariosTab({ scenario }: ScenariosTabProps) {
  const operationalScenarios = scenario.operationalScenarios ?? [];

  return (
    <div className="space-y-3">
      <DetailSection title="Operational Scenarios">
        {operationalScenarios.length === 0 ? (
          <div className="text-sm text-slate-400">No operational scenarios defined.</div>
        ) : (
          <div className="space-y-2">
            {operationalScenarios.map((operationalScenario) => (
              <details
                key={operationalScenario.id}
                className="rounded border border-slate-800 p-2"
              >
                <summary className="cursor-pointer font-medium text-slate-100">
                  {operationalScenario.name}
                </summary>
                <div className="mt-2 space-y-2 text-sm text-slate-300">
                  <p>{operationalScenario.description}</p>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">Steps</div>
                    <ol className="list-decimal space-y-1 pl-4">
                      {operationalScenario.steps.map((step) => (
                        <li key={`${operationalScenario.id}-${step.order}`}>
                          <span className="font-medium">{step.label}:</span> {step.description}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="text-xs text-slate-400">
                    Related events: {operationalScenario.relatedEvents.join(", ") || "None"}
                  </div>
                  <div className="text-xs text-slate-400">
                    Related modes: {operationalScenario.relatedModes.join(", ") || "None"}
                  </div>
                  <div className="text-xs text-slate-400">
                    Related phases: {operationalScenario.relatedPhases.join(", ") || "None"}
                  </div>
                  {operationalScenario.successCriteria.length > 0 ? (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        Success Criteria
                      </div>
                      <ul className="list-disc space-y-0.5 pl-4">
                        {operationalScenario.successCriteria.map((criterion) => (
                          <li key={criterion}>{criterion}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {operationalScenario.operatorNotes.length > 0 ? (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        Operator Notes
                      </div>
                      <ul className="list-disc space-y-0.5 pl-4">
                        {operationalScenario.operatorNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        )}
      </DetailSection>
    </div>
  );
}

export default ScenariosTab;

