import { useMemo, useState } from "react";
import type { MissionScenario } from "../../types/scenario";
import { useSimStore } from "../../store/simStore";
import { getCurrentMissionSnapshot } from "../../lib/missionTimeline";
import { formatSelectionDebug } from "../../lib/selection";
import InspectorTabs, { InspectorTabId } from "./inspector/InspectorTabs";
import MissionOverviewTab from "./inspector/MissionOverviewTab";
import CurrentStateTab from "./inspector/CurrentStateTab";
import ObjectDetailsTab from "./inspector/ObjectDetailsTab";
import ScenariosTab from "./inspector/ScenariosTab";
import ConstraintsTab from "./inspector/ConstraintsTab";
import CommunicationsTab from "./inspector/CommunicationsTab";
import DetailSection from "./inspector/DetailSection";

type DetailInspectorProps = {
  scenario: MissionScenario;
};

function DetailInspector({ scenario }: DetailInspectorProps) {
  const simTime = useSimStore((state) => state.simTime);
  const selectedObjectId = useSimStore((state) => state.selectedObjectId);
  const selectedObjectType = useSimStore((state) => state.selectedObjectType);
  const hoveredObjectId = useSimStore((state) => state.hoveredObjectId);
  const hoveredObjectType = useSimStore((state) => state.hoveredObjectType);
  const [activeTab, setActiveTab] = useState<InspectorTabId>("currentState");

  const snapshot = useMemo(
    () => getCurrentMissionSnapshot(scenario, simTime),
    [scenario, simTime],
  );

  return (
    <div className="space-y-3 text-sm">
      <h2 className="text-lg font-semibold text-slate-100">Detail Inspector</h2>
      <InspectorTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" ? <MissionOverviewTab scenario={scenario} /> : null}
      {activeTab === "currentState" ? (
        <CurrentStateTab scenario={scenario} simTime={simTime} snapshot={snapshot} />
      ) : null}
      {activeTab === "selectedObject" ? (
        <ObjectDetailsTab
          scenario={scenario}
          simTime={simTime}
          selection={{ id: selectedObjectId, type: selectedObjectType }}
        />
      ) : null}
      {activeTab === "scenarios" ? <ScenariosTab scenario={scenario} /> : null}
      {activeTab === "constraints" ? <ConstraintsTab scenario={scenario} /> : null}
      {activeTab === "communications" ? <CommunicationsTab scenario={scenario} /> : null}

      <details className="rounded border border-slate-800 bg-slate-900/60 p-2">
        <summary className="cursor-pointer text-xs uppercase tracking-wide text-slate-400">
          Debug
        </summary>
        <DetailSection title="Runtime Debug">
          <div className="text-xs text-slate-300">Scenario: {scenario.id}</div>
          <div className="text-xs text-slate-300">
            Selected:{" "}
            {formatSelectionDebug({ id: selectedObjectId, type: selectedObjectType })}
          </div>
          <div className="text-xs text-slate-300">
            Hovered: {formatSelectionDebug({ id: hoveredObjectId, type: hoveredObjectType })}
          </div>
          <div className="text-xs text-slate-300">Active phase: {snapshot.activePhase.id}</div>
          <div className="text-xs text-slate-300">Active mode: {snapshot.activeMode.id}</div>
          <div className="text-xs text-slate-300">
            Active events:{" "}
            {snapshot.activeEvents.length > 0
              ? snapshot.activeEvents.map((event) => event.id).join(", ")
              : "None"}
          </div>
          <div className="text-xs text-slate-300">
            Next event: {snapshot.nextEvent?.id ?? "None"}
          </div>
        </DetailSection>
      </details>
    </div>
  );
}

export default DetailInspector;

