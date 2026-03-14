import { useSimStore } from "../../store/simStore";
import { formatMissionElapsedTime, formatNormalizedTime } from "../../lib/time";
import { getObjectDisplayName, getSelectedObjectDetails } from "../../lib/sceneLookup";
import { SATELLITES } from "../../data";
import { getSatelliteOrbitState } from "../../lib/orbit";

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
  const details = getSelectedObjectDetails(
    { id: selectedObjectId, type: selectedObjectType },
    simTime,
  );
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
        <Metric label="Mission Time" value={formatMissionElapsedTime(simTime)} />
        <Metric label="Playback State" value={isPlaying ? "Playing" : "Paused"} />
        <Metric label="Playback Speed" value={`x${playbackSpeed.toFixed(2)}`} />
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
        <Metric label="Hovered Object Id" value={hoveredObjectId ?? "None"} />
        <Metric label="Sim Time Raw" value={simTime.toFixed(6)} />
      </div>
    </div>
  );
}

export default InfoPanel;
