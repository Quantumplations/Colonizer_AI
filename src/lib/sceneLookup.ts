import type { Vector3Tuple } from "three";
import { latLonToCartesian } from "./geo";
import { getSatelliteOrbitState } from "./orbit";
import type { SelectionRef } from "./selection";
import type { MissionScenario } from "../types/scenario";
import {
  getEntityDisplayName,
  getGroundStationById,
  getSatelliteById,
} from "./entityLookup";
import { getScenarioEarthBody } from "./scenarioSelectors";

export type SelectedObjectDetails = {
  name: string;
  typeLabel: string;
  values: Array<{ label: string; value: string }>;
};

export function getObjectDisplayName(
  scenario: MissionScenario,
  selection: SelectionRef,
): string {
  if (!selection.id || !selection.type) {
    return "Nothing selected";
  }
  return getEntityDisplayName(scenario, selection.id, selection.type);
}

export function getObjectWorldPosition(
  scenario: MissionScenario,
  selection: SelectionRef,
  simTime: number,
): Vector3Tuple | null {
  const earth = getScenarioEarthBody(scenario);
  if (!selection.id || !selection.type) {
    return null;
  }
  if (selection.type === "earth") {
    return [0, 0, 0];
  }
  if (selection.type === "satellite") {
    const sat = getSatelliteById(scenario, selection.id);
    if (!sat) {
      return null;
    }
    return getSatelliteOrbitState(simTime, sat.orbit).position;
  }
  if (selection.type === "groundStation") {
    const station = getGroundStationById(scenario, selection.id);
    if (!station || !earth) {
      return null;
    }
    return latLonToCartesian(
      station.latitudeDeg,
      station.longitudeDeg,
      earth.radius + 0.015,
    );
  }
  return null;
}

export function getSelectedObjectDetails(
  scenario: MissionScenario,
  selection: SelectionRef,
  simTime: number,
): SelectedObjectDetails {
  const earth = getScenarioEarthBody(scenario);
  if (!selection.id || !selection.type) {
    return {
      name: "Nothing selected",
      typeLabel: "None",
      values: [],
    };
  }

  if (selection.type === "earth") {
    if (!earth) {
      return {
        name: selection.id,
        typeLabel: "Planet/Body",
        values: [],
      };
    }
    return {
      name: earth.name,
      typeLabel: "Planet/Body",
      values: [{ label: "Radius", value: earth.radius.toFixed(2) }],
    };
  }

  if (selection.type === "satellite") {
    const satellite = getSatelliteById(scenario, selection.id);
    if (!satellite) {
      return {
        name: selection.id,
        typeLabel: "Satellite",
        values: [],
      };
    }
    const pos = getSatelliteOrbitState(simTime, satellite.orbit).position;
    return {
      name: satellite.name,
      typeLabel: "Satellite",
      values: [
        { label: "Orbit Radius", value: satellite.orbit.radius.toFixed(2) },
        { label: "Inclination", value: `${satellite.orbit.inclinationDeg} deg` },
        {
          label: "Position",
          value: `x:${pos[0].toFixed(3)} y:${pos[1].toFixed(3)} z:${pos[2].toFixed(3)}`,
        },
      ],
    };
  }

  const station = getGroundStationById(scenario, selection.id);
  if (!station) {
    return {
      name: selection.id,
      typeLabel: "Ground Station",
      values: [],
    };
  }

  return {
    name: station.name,
    typeLabel: "Ground Station",
    values: [
      { label: "Latitude", value: station.latitudeDeg.toFixed(4) },
      { label: "Longitude", value: station.longitudeDeg.toFixed(4) },
    ],
  };
}

