import type { MissionScenario } from "../../../types/scenario";
import type { SelectionRef } from "../../../lib/selection";
import { getSelectedObjectInspectorData } from "../../../lib/inspectorSelectors";
import DetailSection from "./DetailSection";

type ObjectDetailsTabProps = {
  scenario: MissionScenario;
  selection: SelectionRef;
  simTime: number;
};

function ObjectDetailsTab({ scenario, selection, simTime }: ObjectDetailsTabProps) {
  const details = getSelectedObjectInspectorData(scenario, selection, simTime);

  return (
    <div className="space-y-3">
      <DetailSection title="Selected Object">
        <h3 className="text-base font-semibold text-slate-100">{details.name}</h3>
        <div className="text-xs uppercase tracking-wide text-slate-400">{details.type}</div>
        <p className="text-sm text-slate-300">{details.description}</p>
      </DetailSection>

      <DetailSection title="Details">
        {details.details.length === 0 ? (
          <div className="text-sm text-slate-400">No additional details.</div>
        ) : (
          <ul className="space-y-1 text-sm">
            {details.details.map((item) => (
              <li key={item.label} className="rounded border border-slate-800 p-2">
                <span className="text-xs text-slate-400">{item.label}: </span>
                <span className="text-slate-200">{item.value}</span>
              </li>
            ))}
          </ul>
        )}
      </DetailSection>

      <DetailSection title="Capabilities">
        {details.capabilities.length > 0 ? (
          <ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">
            {details.capabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-slate-400">No capabilities listed.</div>
        )}
      </DetailSection>

      <DetailSection title="Metadata">
        {Object.keys(details.metadata).length > 0 ? (
          <ul className="space-y-1 text-sm text-slate-300">
            {Object.entries(details.metadata).map(([key, value]) => (
              <li key={key} className="rounded border border-slate-800 p-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">{key}</span>
                <div>{String(value)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-slate-400">No metadata available.</div>
        )}
      </DetailSection>
    </div>
  );
}

export default ObjectDetailsTab;

