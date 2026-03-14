import { EARTH_CONFIG, PRIMARY_SATELLITE } from "../config/simConfig";
import { getOrbitState } from "./orbit";
import { SimObjectType } from "../types/sim";

export function getObjectNameById(id: string | null): string {
  if (!id) {
    return "Nothing selected";
  }
  if (id === EARTH_CONFIG.id) {
    return EARTH_CONFIG.name;
  }
  if (id === PRIMARY_SATELLITE.id) {
    return PRIMARY_SATELLITE.name;
  }
  return id;
}

export function getObjectTypeLabel(type: SimObjectType | null): string {
  if (!type) {
    return "None";
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function getPrimarySatellitePosition(simTime: number): [number, number, number] {
  return getOrbitState(simTime, PRIMARY_SATELLITE.orbit).position;
}

