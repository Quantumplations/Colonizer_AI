import type { MissionScenario } from "../../types/scenario";
import { responsiveEarthObservationScenario } from "./responsiveEarthObservation";

export const SCENARIO_REGISTRY: Record<string, MissionScenario> = {
  [responsiveEarthObservationScenario.id]: responsiveEarthObservationScenario,
};

export const DEFAULT_SCENARIO_ID = responsiveEarthObservationScenario.id;

export function getScenarioById(id: string): MissionScenario | null {
  return SCENARIO_REGISTRY[id] ?? null;
}

export function getDefaultScenario(): MissionScenario {
  return SCENARIO_REGISTRY[DEFAULT_SCENARIO_ID];
}

export const ALL_SCENARIOS: MissionScenario[] = Object.values(SCENARIO_REGISTRY);

