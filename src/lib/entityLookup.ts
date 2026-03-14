import type { MissionScenario } from "../types/scenario";
import {
  getScenarioBodyById,
  getScenarioGroundStationById,
  getScenarioSatelliteById,
} from "./scenarioSelectors";

export function getSatelliteById(scenario: MissionScenario, id: string) {
  return getScenarioSatelliteById(scenario, id);
}

export function getGroundStationById(scenario: MissionScenario, id: string) {
  return getScenarioGroundStationById(scenario, id);
}

export function getEntityDisplayName(
  scenario: MissionScenario,
  id: string,
  type: "earth" | "satellite" | "groundStation",
) {
  if (type === "earth") {
    return getScenarioBodyById(scenario, id)?.name ?? id;
  }
  if (type === "satellite") {
    return getSatelliteById(scenario, id)?.name ?? id;
  }
  return getGroundStationById(scenario, id)?.name ?? id;
}

