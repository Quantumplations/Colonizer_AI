import {
  MISSION_PHASES,
  SUBSYSTEM_STATE_TEMPLATES,
  SUBSYSTEM_SUMMARIES_BY_MODE,
  SYSTEM_MODES,
  TIMELINE_EVENTS,
} from "../data";
import {
  MissionPhase,
  SubsystemStateSummary,
  SystemMode,
  TimelineEvent,
} from "../types/mission";
import { clamp01 } from "./time";

const POINT_EVENT_ACTIVE_WINDOW = 0.01;

function inInterval(time: number, start: number, end: number): boolean {
  return time >= start && time < end;
}

export function getActiveInterval<T extends { startTime: number; endTime: number }>(
  intervals: T[],
  normalizedTime: number,
): T | null {
  const time = clamp01(normalizedTime);
  return intervals.find((entry) => inInterval(time, entry.startTime, entry.endTime)) ?? null;
}

function getEventEndTime(event: TimelineEvent): number {
  return event.endTime ?? event.startTime + POINT_EVENT_ACTIVE_WINDOW;
}

export function getActiveEvents(
  events: TimelineEvent[],
  normalizedTime: number,
): TimelineEvent[] {
  const time = clamp01(normalizedTime);
  return events.filter((event) =>
    inInterval(time, event.startTime, getEventEndTime(event)),
  );
}

export function getNextEvent(
  events: TimelineEvent[],
  normalizedTime: number,
): TimelineEvent | null {
  const time = clamp01(normalizedTime);
  return (
    [...events]
      .sort((a, b) => a.startTime - b.startTime)
      .find((event) => event.startTime > time) ?? null
  );
}

export function getPreviousEvent(
  events: TimelineEvent[],
  normalizedTime: number,
): TimelineEvent | null {
  const time = clamp01(normalizedTime);
  const ordered = [...events]
    .sort((a, b) => a.startTime - b.startTime)
    .filter((event) => event.startTime <= time);
  return ordered.length > 0 ? ordered[ordered.length - 1] : null;
}

export function getActiveMissionPhase(normalizedTime: number): MissionPhase {
  return (
    getActiveInterval(MISSION_PHASES, normalizedTime) ??
    MISSION_PHASES[MISSION_PHASES.length - 1]
  );
}

export function getActiveSystemMode(normalizedTime: number): SystemMode {
  return (
    getActiveInterval(SYSTEM_MODES, normalizedTime) ??
    SYSTEM_MODES[SYSTEM_MODES.length - 1]
  );
}

export function getSubsystemSummaryForMode(
  modeId: SystemMode["id"],
): SubsystemStateSummary[] {
  return SUBSYSTEM_SUMMARIES_BY_MODE[modeId] ?? SUBSYSTEM_STATE_TEMPLATES;
}

export function getCurrentMissionSnapshot(normalizedTime: number) {
  const activePhase = getActiveMissionPhase(normalizedTime);
  const activeMode = getActiveSystemMode(normalizedTime);
  const activeEvents = getActiveEvents(TIMELINE_EVENTS, normalizedTime);
  const nextEvent = getNextEvent(TIMELINE_EVENTS, normalizedTime);
  const previousEvent = getPreviousEvent(TIMELINE_EVENTS, normalizedTime);
  const subsystemSummary = getSubsystemSummaryForMode(activeMode.id);

  return {
    activePhase,
    activeMode,
    activeEvents,
    nextEvent,
    previousEvent,
    subsystemSummary,
  };
}

