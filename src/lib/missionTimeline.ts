import type {
  MissionPhase,
  SubsystemStateSummary,
  SystemMode,
  TimelineEvent,
} from "../types/mission";
import type { MissionScenario } from "../types/scenario";
import { clamp01 } from "./time";
import { getScenarioTimeline, getSortedTimelineEvents } from "./scenarioSelectors";

const POINT_EVENT_ACTIVE_WINDOW = 0.01;
const FALLBACK_PHASE: MissionPhase = {
  id: "preLaunch",
  name: "Unknown Phase",
  label: "Unknown Phase",
  shortLabel: "Unknown",
  description: "No phase data available.",
  color: "#64748b",
  startTime: 0,
  endTime: 1,
  objectives: [],
  majorEvents: [],
  exitCriteria: [],
  operationalNotes: [],
};
const FALLBACK_MODE: SystemMode = {
  id: "offLaunch",
  name: "Unknown Mode",
  label: "Unknown Mode",
  description: "No mode data available.",
  color: "#64748b",
  startTime: 0,
  endTime: 1,
  entryConditions: [],
  exitConditions: [],
  operationalPurpose: "Fallback mode when scenario data is unavailable.",
  subsystemStates: [],
  allowedActivities: [],
  inhibitedActivities: [],
  operatorNotes: [],
};

export type MissionSnapshot = {
  activePhase: MissionPhase;
  activeMode: SystemMode;
  activeEvents: TimelineEvent[];
  nextEvent: TimelineEvent | null;
  previousEvent: TimelineEvent | null;
  subsystemSummary: SubsystemStateSummary[];
};

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
  const sorted = [...events].sort((a, b) => a.startTime - b.startTime);
  return sorted.find((event) => event.startTime > time) ?? null;
}

export function getPreviousEvent(
  events: TimelineEvent[],
  normalizedTime: number,
): TimelineEvent | null {
  const time = clamp01(normalizedTime);
  const ordered = [...events].sort((a, b) => a.startTime - b.startTime);
  const pastEvents = ordered.filter((event) => event.startTime <= time);
  return pastEvents.length > 0 ? pastEvents[pastEvents.length - 1] : null;
}

export function getActiveMissionPhase(
  scenario: MissionScenario,
  normalizedTime: number,
): MissionPhase {
  return getActivePhaseForScenario(scenario, normalizedTime);
}

export function getActiveSystemMode(
  scenario: MissionScenario,
  normalizedTime: number,
): SystemMode {
  return getActiveModeForScenario(scenario, normalizedTime);
}

export function getSubsystemSummaryForMode(
  scenario: MissionScenario,
  modeId: SystemMode["id"],
): SubsystemStateSummary[] {
  return (
    scenario.subsystemSummariesByMode[modeId] ??
    scenario.subsystemTemplates ??
    []
  );
}

function getActivePhaseForScenario(
  scenario: MissionScenario,
  normalizedTime: number,
): MissionPhase {
  const { phases } = getScenarioTimeline(scenario);
  return (
    getActiveInterval(phases, normalizedTime) ??
    phases[phases.length - 1] ??
    FALLBACK_PHASE
  );
}

function getActiveModeForScenario(
  scenario: MissionScenario,
  normalizedTime: number,
): SystemMode {
  const { modes } = getScenarioTimeline(scenario);
  return (
    getActiveInterval(modes, normalizedTime) ??
    modes[modes.length - 1] ??
    FALLBACK_MODE
  );
}

export function getCurrentMissionSnapshot(
  scenario: MissionScenario,
  normalizedTime: number,
  events: TimelineEvent[] = getSortedTimelineEvents(scenario),
): MissionSnapshot {
  const activePhase = getActivePhaseForScenario(scenario, normalizedTime);
  const activeMode = getActiveModeForScenario(scenario, normalizedTime);
  const activeEvents = getActiveEvents(events, normalizedTime);
  const nextEvent = getNextEvent(events, normalizedTime);
  const previousEvent = getPreviousEvent(events, normalizedTime);
  const subsystemSummary = getSubsystemSummaryForMode(scenario, activeMode.id);

  return {
    activePhase,
    activeMode,
    activeEvents,
    nextEvent,
    previousEvent,
    subsystemSummary,
  };
}

