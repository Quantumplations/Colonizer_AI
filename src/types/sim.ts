export type SimObjectType = "earth" | "satellite" | "station";

export type OrbitConfig = {
  radius: number;
  inclinationDeg: number;
  angularOffsetDeg: number;
  color: string;
};

export type EarthConfig = {
  id: string;
  name: string;
  type: "earth";
  radius: number;
  color: string;
  atmosphereColor: string;
};

export type SatelliteConfig = {
  id: string;
  name: string;
  type: "satellite";
  radius: number;
  color: string;
  selectedColor: string;
  orbit: OrbitConfig;
};

export type SelectedObjectInfo = {
  id: string;
  type: SimObjectType;
};

