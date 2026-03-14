import { Vector3Tuple } from "three";
import { EARTH, GROUND_STATIONS, SATELLITES } from "../data";
import { latLonToCartesian } from "./geo";
import { getSatelliteOrbitState } from "./orbit";
import { SimObjectType } from "../types/sim";

type Selection = {
  id: string | null;
  type: SimObjectType | null;
};

type SelectedDetails = {
  name: string;
  typeLabel: string;
  values: Array<{ label: string; value: string }>;
};

export function getObjectDisplayName(selection: Selection): string {
  if (!selection.id || !selection.type) {
    return "Nothing selected";
  }
  if (selection.type === "earth") {
    return EARTH.name;
  }
  if (selection.type === "satellite") {
    return SATELLITES.find((sat) => sat.id === selection.id)?.name ?? selection.id;
  }
  if (selection.type === "groundStation") {
    return (
      GROUND_STATIONS.find((station) => station.id === selection.id)?.name ??
      selection.id
    );
  }
  return selection.id;
}

export function getObjectWorldPosition(
  selection: Selection,
  simTime: number,
): Vector3Tuple | null {
  if (!selection.id || !selection.type) {
    return null;
  }
  if (selection.type === "earth") {
    return [0, 0, 0];
  }
  if (selection.type === "satellite") {
    const sat = SATELLITES.find((item) => item.id === selection.id);
    if (!sat) {
      return null;
    }
    return getSatelliteOrbitState(simTime, sat.orbit).position;
  }
  if (selection.type === "groundStation") {
    const station = GROUND_STATIONS.find((item) => item.id === selection.id);
    if (!station) {
      return null;
    }
    return latLonToCartesian(
      station.latitudeDeg,
      station.longitudeDeg,
      EARTH.radius + 0.015,
    );
  }
  return null;
}

export function getSelectedObjectDetails(
  selection: Selection,
  simTime: number,
): SelectedDetails {
  if (!selection.id || !selection.type) {
    return {
      name: "Nothing selected",
      typeLabel: "None",
      values: [],
    };
  }

  if (selection.type === "earth") {
    return {
      name: EARTH.name,
      typeLabel: "Planet/Body",
      values: [{ label: "Radius", value: EARTH.radius.toFixed(2) }],
    };
  }

  if (selection.type === "satellite") {
    const satellite = SATELLITES.find((item) => item.id === selection.id);
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

  const station = GROUND_STATIONS.find((item) => item.id === selection.id);
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

