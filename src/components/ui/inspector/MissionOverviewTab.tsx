import type { MissionScenario } from "../../../types/scenario";
import { formatMissionDurationSummary } from "../../../lib/time";
import DetailSection from "./DetailSection";

type MissionOverviewTabProps = {
  scenario: MissionScenario;
};

function MissionOverviewTab({ scenario }: MissionOverviewTabProps) {
  return (
    <div className="space-y-3">
      <DetailSection title="Mission">
        <h3 className="text-base font-semibold text-slate-100">{scenario.name}</h3>
        <p className="text-sm text-slate-300">{scenario.description}</p>
        <p className="text-sm text-slate-300">{scenario.summary}</p>
        <div className="text-xs text-slate-400">
          Duration: {formatMissionDurationSummary(scenario.missionDurationSeconds)} (
          {scenario.missionDurationLabel})
        </div>
      </DetailSection>

      <DetailSection title="Objectives">
        <ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">
          {scenario.missionObjectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </DetailSection>

      <DetailSection title="Assumptions">
        <ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">
          {scenario.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </DetailSection>

      {scenario.notes && scenario.notes.length > 0 ? (
        <DetailSection title="Notes">
          <ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">
            {scenario.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </DetailSection>
      ) : null}

      {scenario.references && scenario.references.length > 0 ? (
        <DetailSection title="References">
          <ul className="space-y-1 text-sm text-slate-300">
            {scenario.references.map((reference) => (
              <li key={reference.title} className="rounded border border-slate-800 p-2">
                <div className="font-medium text-slate-100">{reference.title}</div>
                <div className="text-xs text-slate-400">{reference.source}</div>
                {reference.note ? <div className="text-xs">{reference.note}</div> : null}
              </li>
            ))}
          </ul>
        </DetailSection>
      ) : null}
    </div>
  );
}

export default MissionOverviewTab;

