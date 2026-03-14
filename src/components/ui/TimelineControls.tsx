import { ChangeEvent, useMemo, useState } from "react";
import { useSimStore } from "../../store/simStore";
import { formatMissionElapsedTime, formatNormalizedTime } from "../../lib/time";
import { PLAYBACK_SPEED_OPTIONS } from "../../config/simSettings";
import { TIMELINE_EVENTS } from "../../data";

function TimelineControls() {
  const simTime = useSimStore((state) => state.simTime);
  const isPlaying = useSimStore((state) => state.isPlaying);
  const playbackSpeed = useSimStore((state) => state.playbackSpeed);
  const setSimTime = useSimStore((state) => state.setSimTime);
  const togglePlay = useSimStore((state) => state.togglePlay);
  const setPlaybackSpeed = useSimStore((state) => state.setPlaybackSpeed);
  const requestCameraCommand = useSimStore((state) => state.requestCameraCommand);
  const selectedObjectId = useSimStore((state) => state.selectedObjectId);
  const selectObject = useSimStore((state) => state.selectObject);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const activeEvent = useMemo(
    () => TIMELINE_EVENTS.find((event) => event.id === activeEventId) ?? null,
    [activeEventId],
  );

  const onSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSimTime(Number(event.target.value));
  };

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
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">Time</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={simTime}
          onChange={onSliderChange}
          className="h-2 w-full cursor-pointer rounded accent-sky-500"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Timeline Events</span>
          <span>{activeEvent ? activeEvent.label : "Hover/click marker"}</span>
        </div>
        <div className="relative h-6 rounded border border-slate-800 bg-slate-900/80">
          {TIMELINE_EVENTS.map((event) => (
            <button
              key={event.id}
              type="button"
              title={event.label}
              onMouseEnter={() => setActiveEventId(event.id)}
              onMouseLeave={() => setActiveEventId((prev) => (prev === event.id ? null : prev))}
              onClick={() => {
                setSimTime(event.time);
                setActiveEventId(event.id);
                if (event.relatedObjectId && event.relatedObjectType) {
                  selectObject(event.relatedObjectId, event.relatedObjectType);
                }
              }}
              className="absolute top-1/2 h-3 w-2 -translate-y-1/2 rounded-sm bg-amber-400 hover:bg-amber-300"
              style={{ left: `calc(${event.time * 100}% - 4px)` }}
            />
          ))}
        </div>
      </div>

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
