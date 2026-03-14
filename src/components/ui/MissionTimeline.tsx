import { ChangeEvent, useMemo, useState } from "react";
import { useSimStore } from "../../store/simStore";
import {
  getActiveEvents,
  getCurrentMissionSnapshot,
} from "../../lib/missionTimeline";
import { clamp01 } from "../../lib/time";
import type { TimelineEvent } from "../../types/mission";
import type { MissionScenario } from "../../types/scenario";
import { getScenarioTimeline } from "../../lib/scenarioSelectors";

function getSegmentStyle(startTime: number, endTime: number) {
  return {
    left: `${startTime * 100}%`,
    width: `${(endTime - startTime) * 100}%`,
  };
}

type MissionTimelineProps = {
  scenario: MissionScenario;
};

function MissionTimeline({ scenario }: MissionTimelineProps) {
  const simTime = useSimStore((state) => state.simTime);
  const setSimTime = useSimStore((state) => state.setSimTime);
  const selectObject = useSimStore((state) => state.selectObject);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  const snapshot = getCurrentMissionSnapshot(scenario, simTime);
  const { phases, modes, events } = getScenarioTimeline(scenario);
  const activeEventIds = useMemo(
    () => new Set(getActiveEvents(events, simTime).map((event) => event.id)),
    [events, simTime],
  );

  const onSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSimTime(Number(event.target.value));
  };

  const indicatorPosition = `${clamp01(simTime) * 100}%`;
  const hoveredEvent = events.find((event) => event.id === hoveredEventId) ?? null;

  const handleEventSelect = (event: TimelineEvent) => {
    setSimTime(event.startTime);
    if (event.relatedObjectId && event.relatedObjectType) {
      selectObject(event.relatedObjectId, event.relatedObjectType);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-slate-300">
        <span>Phase: {snapshot.activePhase.label}</span>
        <span>{hoveredEvent ? hoveredEvent.label : "Mission timeline"}</span>
      </div>

      <div className="relative rounded border border-slate-800 bg-slate-900/80 p-2">
        <div className="relative h-5 overflow-hidden rounded bg-slate-950/80">
          {phases.map((phase) => (
            <button
              key={phase.id}
              type="button"
              title={phase.description}
              onClick={() => setSimTime(phase.startTime)}
              className="absolute inset-y-0 border-r border-slate-950/50"
              style={{
                ...getSegmentStyle(phase.startTime, phase.endTime),
                backgroundColor: phase.color,
                opacity: snapshot.activePhase.id === phase.id ? 0.9 : 0.5,
              }}
            />
          ))}
          <div
            className="absolute inset-y-0 w-[2px] bg-white"
            style={{ left: indicatorPosition }}
          />
        </div>

        <div className="relative mt-1 h-3 overflow-hidden rounded bg-slate-950/70">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className="absolute inset-y-0"
              style={{
                ...getSegmentStyle(mode.startTime, mode.endTime),
                backgroundColor: mode.color,
                opacity: snapshot.activeMode.id === mode.id ? 0.8 : 0.35,
              }}
              title={mode.label}
            />
          ))}
          <div
            className="absolute inset-y-0 w-[2px] bg-white"
            style={{ left: indicatorPosition }}
          />
        </div>

        <div className="relative mt-2 h-8 overflow-hidden rounded bg-slate-950/80">
          {events.map((event) => {
            const isInterval = typeof event.endTime === "number";
            const isActive = activeEventIds.has(event.id);

            if (isInterval) {
              return (
                <button
                  key={event.id}
                  type="button"
                  title={`${event.type}: ${event.label}`}
                  onMouseEnter={() => setHoveredEventId(event.id)}
                  onMouseLeave={() =>
                    setHoveredEventId((prev) => (prev === event.id ? null : prev))
                  }
                  onClick={() => handleEventSelect(event)}
                  className="absolute top-1/2 h-4 -translate-y-1/2 rounded border border-slate-950/40"
                  style={{
                    ...getSegmentStyle(
                      event.startTime,
                      event.endTime ?? event.startTime,
                    ),
                    backgroundColor: event.color ?? "#fbbf24",
                    opacity: isActive ? 1 : 0.65,
                    boxShadow: isActive ? "0 0 0 1px #ffffff inset" : "none",
                  }}
                />
              );
            }

            return (
              <button
                key={event.id}
                type="button"
                title={`${event.type}: ${event.label}`}
                onMouseEnter={() => setHoveredEventId(event.id)}
                onMouseLeave={() =>
                  setHoveredEventId((prev) => (prev === event.id ? null : prev))
                }
                onClick={() => handleEventSelect(event)}
                className="absolute top-1/2 h-5 w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-sm"
                style={{
                  left: `${event.startTime * 100}%`,
                  backgroundColor: event.color ?? "#fbbf24",
                  opacity: isActive ? 1 : 0.75,
                  boxShadow: isActive ? "0 0 0 1px #ffffff" : "none",
                }}
              />
            );
          })}
          <div
            className="absolute inset-y-0 w-[2px] bg-white"
            style={{ left: indicatorPosition }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">Scrub</span>
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
    </div>
  );
}

export default MissionTimeline;

