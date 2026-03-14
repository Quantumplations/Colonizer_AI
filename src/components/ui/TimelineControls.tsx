import { useSimStore } from "../../store/simStore";
import {
  formatMissionDurationSummary,
  formatMissionElapsedTime,
  formatNormalizedTime,
} from "../../lib/time";
import { PLAYBACK_SPEED_OPTIONS } from "../../config/simSettings";
import MissionTimeline from "./MissionTimeline";
import { getCurrentMissionSnapshot } from "../../lib/missionTimeline";

function TimelineControls() {
  const simTime = useSimStore((state) => state.simTime);
  const isPlaying = useSimStore((state) => state.isPlaying);
  const playbackSpeed = useSimStore((state) => state.playbackSpeed);
  const togglePlay = useSimStore((state) => state.togglePlay);
  const setPlaybackSpeed = useSimStore((state) => state.setPlaybackSpeed);
  const requestCameraCommand = useSimStore((state) => state.requestCameraCommand);
  const selectedObjectId = useSimStore((state) => state.selectedObjectId);
  const snapshot = getCurrentMissionSnapshot(simTime);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="min-w-24 rounded bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            type="button"
            onClick={() => requestCameraCommand("reset")}
            className="rounded border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
          >
            Reset Camera
          </button>
          <button
            type="button"
            onClick={() => requestCameraCommand("focusSelected")}
            disabled={!selectedObjectId}
            className="rounded border border-slate-700 px-3 py-2 text-xs text-slate-200 enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Focus Selected
          </button>
        </div>

        <div className="text-right text-xs text-slate-300">
          <div>t = {formatNormalizedTime(simTime)}</div>
          <div>{formatMissionElapsedTime(simTime)}</div>
          <div className="text-[10px] text-slate-500">
            duration {formatMissionDurationSummary()}
          </div>
          <div className="text-[10px] text-slate-400">
            {snapshot.activeEvents.length > 0
              ? `Active: ${snapshot.activeEvents.map((item) => item.label).join(", ")}`
              : "Active: none"}
          </div>
        </div>
      </div>

      <MissionTimeline />

      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">Speed</span>
        {PLAYBACK_SPEED_OPTIONS.map((speed) => (
          <button
            key={speed}
            type="button"
            onClick={() => setPlaybackSpeed(speed)}
            className={`rounded px-2 py-1 ${
              speed === playbackSpeed
                ? "bg-sky-600 text-white"
                : "border border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            x{speed}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TimelineControls;
