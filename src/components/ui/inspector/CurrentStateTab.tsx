import type { MissionScenario } from "../../../types/scenario";
import type { MissionSnapshot } from "../../../lib/missionTimeline";
import { formatMissionElapsedTime, formatNormalizedTime } from "../../../lib/time";
import {
  getEventInspectorDetails,
  getNextEventInspectorPreview,
} from "../../../lib/inspectorSelectors";
import DetailSection from "./DetailSection";
import SubsystemsCard from "./SubsystemsCard";

type CurrentStateTabProps = {
  scenario: MissionScenario;
  simTime: number;
  snapshot: MissionSnapshot;
};

function renderList(items: string[], fallback: string) {
  if (items.length === 0) {
    return <div className="text-xs text-slate-400">{fallback}</div>;
  }
  return (
    <ul className="list-disc space-y-0.5 pl-4 text-sm text-slate-300">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function CurrentStateTab({ scenario, simTime, snapshot }: CurrentStateTabProps) {
  const activeEventDetails = getEventInspectorDetails(scenario, snapshot);
  const nextEventPreview = getNextEventInspectorPreview(scenario, snapshot);
  const activeModeDetails = snapshot.activeMode.subsystemStates ?? [];

  return (
    <div className="space-y-3">
      <DetailSection title="Current Time State">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded border border-slate-800 p-2">
            <div className="text-xs text-slate-400">Normalized</div>
            <div className="font-medium text-slate-100">{formatNormalizedTime(simTime)}</div>
          </div>
          <div className="rounded border border-slate-800 p-2">
            <div className="text-xs text-slate-400">Mission Elapsed</div>
            <div className="font-medium text-slate-100">
              {formatMissionElapsedTime(simTime, scenario.missionDurationSeconds)}
            </div>
          </div>
        </div>
      </DetailSection>

      <DetailSection title={`Active Phase - ${snapshot.activePhase.label}`}>
        <p className="text-sm text-slate-300">{snapshot.activePhase.description}</p>
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Objectives</div>
          {renderList(snapshot.activePhase.objectives ?? [], "No objectives listed.")}
        </div>
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Major Events</div>
          {renderList(snapshot.activePhase.majorEvents ?? [], "No major events listed.")}
        </div>
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Exit Criteria</div>
          {renderList(snapshot.activePhase.exitCriteria ?? [], "No exit criteria listed.")}
        </div>
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Operational Notes</div>
          {renderList(
            snapshot.activePhase.operationalNotes ?? [],
            "No operational notes listed.",
          )}
        </div>
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Success Criteria</div>
          {renderList(snapshot.activePhase.successCriteria ?? [], "No success criteria listed.")}
        </div>
      </DetailSection>

      <DetailSection title={`Active Mode - ${snapshot.activeMode.label}`}>
        <p className="text-sm text-slate-300">{snapshot.activeMode.description}</p>
        <div className="text-sm text-slate-300">
          <span className="text-xs text-slate-400">Operational Purpose: </span>
          {snapshot.activeMode.operationalPurpose || "No operational purpose listed."}
        </div>
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Entry Conditions</div>
          {renderList(snapshot.activeMode.entryConditions ?? [], "No entry conditions listed.")}
        </div>
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Exit Conditions</div>
          {renderList(snapshot.activeMode.exitConditions ?? [], "No exit conditions listed.")}
        </div>
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Allowed Activities</div>
          {renderList(
            snapshot.activeMode.allowedActivities ?? [],
            "No allowed activities listed.",
          )}
        </div>
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Inhibited Activities</div>
          {renderList(
            snapshot.activeMode.inhibitedActivities ?? [],
            "No inhibited activities listed.",
          )}
        </div>
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Operator Notes</div>
          {renderList(snapshot.activeMode.operatorNotes ?? [], "No operator notes listed.")}
        </div>
      </DetailSection>

      <DetailSection title="Active Events">
        {activeEventDetails.length === 0 ? (
          <div className="text-sm text-slate-400">No active events at current time.</div>
        ) : (
          <div className="space-y-2">
            {activeEventDetails.map((event) => (
              <article key={event.id} className="rounded border border-slate-800 p-2">
                <div className="font-medium text-slate-100">{event.label}</div>
                <div className="text-xs text-slate-400">
                  {event.type} | {event.timeRange}
                </div>
                <div className="mt-1 text-sm text-slate-300">{event.description}</div>
                <div className="text-xs text-slate-400">Objective: {event.objective}</div>
                <div className="text-xs text-slate-400">
                  Related: scenario={event.relatedScenario}, phase={event.relatedPhase}, mode=
                  {event.relatedMode}
                </div>
                {event.linkedConstraints.length > 0 ? (
                  <div className="text-xs text-slate-400">
                    Constraints: {event.linkedConstraints.join("; ")}
                  </div>
                ) : null}
                {event.operatorNotes.length > 0 ? (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-300">
                    {event.operatorNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Next Event">
        {nextEventPreview ? (
          <article className="rounded border border-slate-800 p-2 text-sm">
            <div className="font-medium text-slate-100">{nextEventPreview.label}</div>
            <div className="text-xs text-slate-400">
              {nextEventPreview.type} | {nextEventPreview.timeRange}
            </div>
            <div className="text-xs text-slate-400">
              phase={nextEventPreview.relatedPhase} | mode={nextEventPreview.relatedMode}
            </div>
          </article>
        ) : (
          <div className="text-sm text-slate-400">No upcoming event.</div>
        )}
      </DetailSection>

      <SubsystemsCard
        subsystemSummary={snapshot.subsystemSummary}
        modeSubsystemDetails={activeModeDetails}
      />
    </div>
  );
}

export default CurrentStateTab;

