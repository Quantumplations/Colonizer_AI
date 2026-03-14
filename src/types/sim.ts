export type SimObjectType = "earth" | "satellite" | "groundStation";

export type OrbitConfig = {
  radius: number;
  inclinationDeg: number;
  angularOffsetDeg: number;
  color: string;
  speedMultiplier?: number;
};

export type EarthConfig = {
  id: string;
  name: string;
  type: "earth";
  radius: number;
  color: string;
  atmosphereColor: string;
  description?: string;
  metadata?: Record<string, string>;
};

export type SatelliteConfig = {
  id: string;
  name: string;
  type: "satellite";
  radius: number;
  color: string;
  selectedColor: string;
  orbit: OrbitConfig;
  description?: string;
  capabilities?: string[];
  metadata?: Record<string, string>;
};

export type GroundStationConfig = {
  id: string;
  name: string;
  type: "groundStation";
  latitudeDeg: number;
  longitudeDeg: number;
  color: string;
  radius: number;
  description?: string;
  capabilities?: string[];
  metadata?: Record<string, string>;
};

export type SelectedObjectInfo = {
  id: string;
  type: SimObjectType;
};

