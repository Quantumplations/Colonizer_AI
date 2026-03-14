import { Vector3Tuple } from "three";
import { OrbitConfig } from "../types/sim";

const FULL_CIRCLE_RADIANS = Math.PI * 2;

type OrbitState = {
  position: Vector3Tuple;
  tangent: Vector3Tuple;
};

function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function getOrbitState(
  normalizedTime: number,
  orbit: OrbitConfig,
): OrbitState {
  const inclination = degreesToRadians(orbit.inclinationDeg);
  const angularOffset = degreesToRadians(orbit.angularOffsetDeg);
  const theta = normalizedTime * FULL_CIRCLE_RADIANS + angularOffset;

  const baseX = orbit.radius * Math.cos(theta);
  const baseZ = orbit.radius * Math.sin(theta);
  const dx = -Math.sin(theta);
  const dz = Math.cos(theta);

  const y = baseZ * Math.sin(inclination);
  const z = baseZ * Math.cos(inclination);

  const tangentY = dz * Math.sin(inclination);
  const tangentZ = dz * Math.cos(inclination);

  return {
    position: [baseX, y, z],
    tangent: [dx, tangentY, tangentZ],
  };
}

export function getSatelliteOrbitState(
  normalizedTime: number,
  orbit: OrbitConfig,
): OrbitState {
  const speedMultiplier = orbit.speedMultiplier ?? 1;
  const adjustedTime = ((normalizedTime * speedMultiplier) % 1 + 1) % 1;
  return getOrbitState(adjustedTime, orbit);
}

export function getOrbitPathPoints(
  orbit: OrbitConfig,
  segments = 128,
): Vector3Tuple[] {
  return Array.from({ length: segments + 1 }, (_, index) => {
    const normalized = index / segments;
    return getSatelliteOrbitState(normalized, orbit).position;
  });
}
