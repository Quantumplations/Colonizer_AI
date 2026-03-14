import { useSimStore } from "../../store/simStore";
import {
  formatMissionDurationSummary,
  formatMissionElapsedTime,
  formatNormalizedTime,
} from "../../lib/time";
import { getObjectDisplayName, getSelectedObjectDetails } from "../../lib/sceneLookup";
import { MISSION_TIMELINE_CONFIG, SATELLITES } from "../../data";
import { getSatelliteOrbitState } from "../../lib/orbit";
import { getCurrentMissionSnapshot } from "../../lib/missionTimeline";
import { formatSelectionDebug } from "../../lib/selection";

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-sm font-medium text-slate-100">{value}</div>
    </div>
  );
}

function InfoPanel() {
  const simTime = useSimStore((state) => state.simTime);
  const isPlaying = useSimStore((state) => state.isPlaying);
  const playbackSpeed = useSimStore((state) => state.playbackSpeed);
  const selectedObjectId = useSimStore((state) => state.selectedObjectId);
  const selectedObjectType = useSimStore((state) => state.selectedObjectType);
  const showSatellites = useSimStore((state) => state.showSatellites);
  const showOrbits = useSimStore((state) => state.showOrbits);
  const showGroundStations = useSimStore((state) => state.showGroundStations);
  const showLabels = useSimStore((state) => state.showLabels);
  const toggleLayer = useSimStore((state) => state.toggleLayer);
  const hoveredObjectId = useSimStore((state) => state.hoveredObjectId);
  const hoveredObjectType = useSimStore((state) => state.hoveredObjectType);
  const details = getSelectedObjectDetails(
    { id: selectedObjectId, type: selectedObjectType },
    simTime,
  );
  const snapshot = getCurrentMissionSnapshot(simTime);
  const firstSat = SATELLITES[0];
  const firstSatPos = firstSat
    ? getSatelliteOrbitState(simTime, firstSat.orbit).position
    : [0, 0, 0];
  const selectedName = getObjectDisplayName({
    id: selectedObjectId,
    type: selectedObjectType,
  });

  return (
    <div className="space-y-5 text-sm">
      <h2 className="text-lg font-semibold text-slate-100">Simulator Info</h2>

      <div className="space-y-3 rounded border border-slate-800 bg-slate-900/60 p-3">
        <Metric label="Selected Object" value={selectedName} />
        <Metric label="Object Type" value={details.typeLabel} />
        {details.values.map((item) => (
          <Metric key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <div className="space-y-3 rounded border border-slate-800 bg-slate-900/60 p-3">
        <Metric label="Normalized Time" value={formatNormalizedTime(simTime)} />
        <Metric label="Mission Elapsed" value={formatMissionElapsedTime(simTime)} />
        <Metric
          label="Mission Duration"
          value={`${formatMissionDurationSummary()} (${MISSION_TIMELINE_CONFIG.referenceLabel})`}
        />
        <Metric label="Playback State" value={isPlaying ? "Playing" : "Paused"} />
        <Metric label="Playback Speed" value={`x${playbackSpeed.toFixed(2)}`} />
      </div>

      <div className="space-y-3 rounded border border-slate-800 bg-slate-900/60 p-3">
        <div className="text-xs uppercase tracking-wide text-slate-400">Mission State</div>
        <Metric label="Active Phase" value={snapshot.activePhase.label} />
        <Metric label="Active Mode" value={snapshot.activeMode.label} />
        <Metric
          label="Active Events"
          value={
            snapshot.activeEvents.length > 0
              ? snapshot.activeEvents.map((event) => event.label).join(", ")
              : "None"
          }
        />
        <Metric
          label="Next Event"
          value={snapshot.nextEvent ? snapshot.nextEvent.label : "None"}
        />
      </div>

      <div className="space-y-3 rounded border border-slate-800 bg-slate-900/60 p-3">
        <div className="text-xs uppercase tracking-wide text-slate-400">
          Subsystem Summary
        </div>
        {snapshot.subsystemSummary.map((subsystem) => (
          <div key={subsystem.id} className="rounded border border-slate-800 p-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-100">
                {subsystem.label}
              </span>
              <span
                className="rounded px-2 py-0.5 text-[10px] font-semibold text-slate-950"
                style={{ backgroundColor: subsystem.color }}
              >
                {subsystem.status.toUpperCase()}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-300">{subsystem.summary}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded border border-slate-800 bg-slate-900/60 p-3">
        <div className="text-xs uppercase tracking-wide text-slate-400">Layers</div>
        <label className="flex items-center justify-between text-sm text-slate-200">
          <span>Satellites</span>
          <input
            type="checkbox"
            checked={showSatellites}
            onChange={() => toggleLayer("satellites")}
            className="h-4 w-4 accent-sky-500"
          />
        </label>
        <label className="flex items-center justify-between text-sm text-slate-200">
          <span>Orbit Tracks</span>
          <input
            type="checkbox"
            checked={showOrbits}
            onChange={() => toggleLayer("orbits")}
            className="h-4 w-4 accent-sky-500"
          />
        </label>
        <label className="flex items-center justify-between text-sm text-slate-200">
          <span>Ground Stations</span>
          <input
            type="checkbox"
            checked={showGroundStations}
            onChange={() => toggleLayer("groundStations")}
            className="h-4 w-4 accent-sky-500"
          />
        </label>
        <label className="flex items-center justify-between text-sm text-slate-200">
          <span>Labels</span>
          <input
            type="checkbox"
            checked={showLabels}
            onChange={() => toggleLayer("labels")}
            className="h-4 w-4 accent-sky-500"
          />
        </label>
      </div>

      <div className="space-y-3 rounded border border-slate-800 bg-slate-900/60 p-3">
        <div className="text-xs uppercase tracking-wide text-slate-400">Debug</div>
        <Metric
          label={`${firstSat?.name ?? "Satellite"} Position`}
          value={`x:${firstSatPos[0].toFixed(3)} y:${firstSatPos[1].toFixed(3)} z:${firstSatPos[2].toFixed(3)}`}
        />
        <Metric
          label="Selected Ref"
          value={formatSelectionDebug({
            id: selectedObjectId,
            type: selectedObjectType,
          })}
        />
        <Metric
          label="Hovered Ref"
          value={formatSelectionDebug({ id: hoveredObjectId, type: hoveredObjectType })}
        />
        <Metric label="Active Phase Id" value={snapshot.activePhase.id} />
        <Metric label="Active Mode Id" value={snapshot.activeMode.id} />
        <Metric
          label="Active Event Ids"
          value={
            snapshot.activeEvents.length > 0
              ? snapshot.activeEvents.map((event) => event.id).join(", ")
              : "None"
          }
        />
        <Metric label="Next Event Id" value={snapshot.nextEvent?.id ?? "None"} />
        <Metric label="Sim Time Raw" value={simTime.toFixed(6)} />
      </div>
    </div>
  );
}

export default InfoPanel;
