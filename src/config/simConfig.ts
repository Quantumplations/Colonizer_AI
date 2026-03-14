import { EarthConfig, SatelliteConfig } from "../types/sim";

export const EARTH_CONFIG: EarthConfig = {
  id: "earth-1",
  name: "Earth",
  type: "earth",
  radius: 1,
  color: "#2f6fed",
  atmosphereColor: "#75a7ff",
};

export const PRIMARY_SATELLITE: SatelliteConfig = {
  id: "satellite-1",
  name: "Explorer-1 Satellite",
  type: "satellite",
  radius: 0.07,
  color: "#f8fafc",
  selectedColor: "#f97316",
  orbit: {
    radius: 1.8,
    inclinationDeg: 30,
    angularOffsetDeg: 15,
    color: "#94a3b8",
  },
};

export const PLAYBACK_SPEED_OPTIONS = [0.05, 0.1, 0.25, 0.5, 1] as const;
export const DEFAULT_PLAYBACK_SPEED = 0.1;
export const MAX_SIM_DELTA_SECONDS = 0.25;

