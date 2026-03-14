import type { Vector3Tuple } from "three";

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function latLonToCartesian(
  latitudeDeg: number,
  longitudeDeg: number,
  radius: number,
): Vector3Tuple {
  const lat = degToRad(latitudeDeg);
  const lon = degToRad(longitudeDeg);

  const x = radius * Math.cos(lat) * Math.cos(lon);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.sin(lon);

  return [x, y, z];
}

