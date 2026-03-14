import { useSimStore } from "../../store/simStore";
import { formatMissionElapsedTime, formatNormalizedTime } from "../../lib/time";
import {
  getObjectNameById,
  getObjectTypeLabel,
  getPrimarySatellitePosition,
} from "../../lib/simObjects";
import { PRIMARY_SATELLITE } from "../../config/simConfig";

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
  const satPosition = getPrimarySatellitePosition(simTime);
  const selectedName = getObjectNameById(selectedObjectId);

  return (
    <div className="space-y-5 text-sm">
      <h2 className="text-lg font-semibold text-slate-100">Simulator Info</h2>

      <div className="space-y-3 rounded border border-slate-800 bg-slate-900/60 p-3">
        <Metric label="Selected Object" value={selectedName} />
        <Metric label="Object Type" value={getObjectTypeLabel(selectedObjectType)} />
      </div>

      <div className="space-y-3 rounded border border-slate-800 bg-slate-900/60 p-3">
        <Metric label="Normalized Time" value={formatNormalizedTime(simTime)} />
        <Metric label="Mission Time" value={formatMissionElapsedTime(simTime)} />
        <Metric label="Playback State" value={isPlaying ? "Playing" : "Paused"} />
        <Metric label="Playback Speed" value={`x${playbackSpeed.toFixed(2)}`} />
      </div>

      <div className="space-y-3 rounded border border-slate-800 bg-slate-900/60 p-3">
        <div className="text-xs uppercase tracking-wide text-slate-400">Debug</div>
        <Metric
          label="Satellite Position"
          value={`x:${satPosition[0].toFixed(3)} y:${satPosition[1].toFixed(3)} z:${satPosition[2].toFixed(3)}`}
        />
        <Metric
          label="Orbit Radius"
          value={PRIMARY_SATELLITE.orbit.radius.toFixed(2)}
        />
        <Metric label="Sim Time Raw" value={simTime.toFixed(6)} />
      </div>
    </div>
  );
}

export default InfoPanel;
