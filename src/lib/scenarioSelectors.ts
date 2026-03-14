import type {
  CelestialBodyConfig,
  MissionScenario,
  ScenarioSelectionRef,
} from "../types/scenario";
import type { GroundStationConfig, SatelliteConfig } from "../types/sim";
import type { MissionPhase, SystemMode, TimelineEvent } from "../types/mission";
import type { OperationalConstraint, OperationalScenario } from "../types/scenario";

export function getScenarioBodies(scenario: MissionScenario): CelestialBodyConfig[] {
  return scenario.bodies ?? [];
}

export function getScenarioEarthBody(
  scenario: MissionScenario,
): CelestialBodyConfig | null {
  return getScenarioBodies(scenario).find((body) => body.type === "earth") ?? null;
}

export function getScenarioSatellites(scenario: MissionScenario): SatelliteConfig[] {
  return scenario.satellites ?? [];
}

export function getScenarioGroundStations(
  scenario: MissionScenario,
): GroundStationConfig[] {
  return scenario.groundStations ?? [];
}

export function getScenarioTimeline(scenario: MissionScenario) {
  return {
    phases: scenario.phases ?? [],
    modes: scenario.modes ?? [],
    events: scenario.events ?? [],
  };
}

export function getScenarioMissionPhases(scenario: MissionScenario): MissionPhase[] {
  return scenario.phases ?? [];
}

export function getScenarioSystemModes(scenario: MissionScenario): SystemMode[] {
  return scenario.modes ?? [];
}

export function getScenarioEvents(scenario: MissionScenario): TimelineEvent[] {
  return scenario.events ?? [];
}

export function getMissionDurationSeconds(scenario: MissionScenario): number {
  return scenario.missionDurationSeconds;
}

export function getMissionDurationLabel(scenario: MissionScenario): string {
  return scenario.missionDurationLabel;
}

export function getScenarioOperationalScenarios(
  scenario: MissionScenario,
): OperationalScenario[] {
  return scenario.operationalScenarios ?? [];
}

export function getScenarioConstraints(
  scenario: MissionScenario,
): OperationalConstraint[] {
  return scenario.operationalConstraints ?? [];
}

export function getScenarioSatelliteById(
  scenario: MissionScenario,
  id: string,
): SatelliteConfig | null {
  return getScenarioSatellites(scenario).find((satellite) => satellite.id === id) ?? null;
}

export function getScenarioGroundStationById(
  scenario: MissionScenario,
  id: string,
): GroundStationConfig | null {
  return getScenarioGroundStations(scenario).find((station) => station.id === id) ?? null;
}

export function getScenarioBodyById(
  scenario: MissionScenario,
  id: string,
): CelestialBodyConfig | null {
  return getScenarioBodies(scenario).find((body) => body.id === id) ?? null;
}

export function getScenarioObjectDisplayName(
  scenario: MissionScenario,
  selection: ScenarioSelectionRef,
): string {
  if (selection.type === "earth") {
    return getScenarioBodyById(scenario, selection.id)?.name ?? selection.id;
  }
  if (selection.type === "satellite") {
    return getScenarioSatelliteById(scenario, selection.id)?.name ?? selection.id;
  }
  return getScenarioGroundStationById(scenario, selection.id)?.name ?? selection.id;
}

export function getSortedTimelineEvents(scenario: MissionScenario): TimelineEvent[] {
  return [...getScenarioEvents(scenario)].sort((a, b) => a.startTime - b.startTime);
}

export function getScenarioPhaseById(
  scenario: MissionScenario,
  id: string,
): MissionPhase | null {
  return getScenarioMissionPhases(scenario).find((phase) => phase.id === id) ?? null;
}

export function getScenarioModeById(
  scenario: MissionScenario,
  id: string,
): SystemMode | null {
  return getScenarioSystemModes(scenario).find((mode) => mode.id === id) ?? null;
}

export function getScenarioOperationalScenarioById(
  scenario: MissionScenario,
  id: string,
): OperationalScenario | null {
  return (
    getScenarioOperationalScenarios(scenario).find((scenarioItem) => scenarioItem.id === id) ??
    null
  );
}

export function getScenarioConstraintById(
  scenario: MissionScenario,
  id: string,
): OperationalConstraint | null {
  return getScenarioConstraints(scenario).find((constraint) => constraint.id === id) ?? null;
}

