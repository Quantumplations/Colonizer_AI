import { SatelliteConfig } from "../types/sim";

export const SATELLITES: SatelliteConfig[] = [
  {
    id: "satellite-1",
    name: "Explorer-1",
    type: "satellite",
    radius: 0.07,
    color: "#f8fafc",
    selectedColor: "#f97316",
    orbit: {
      radius: 1.8,
      inclinationDeg: 30,
      angularOffsetDeg: 15,
      color: "#93c5fd",
      speedMultiplier: 1,
    },
  },
  {
    id: "satellite-2",
    name: "Aurora-2",
    type: "satellite",
    radius: 0.065,
    color: "#c4b5fd",
    selectedColor: "#f59e0b",
    orbit: {
      radius: 2.2,
      inclinationDeg: 50,
      angularOffsetDeg: 120,
      color: "#c4b5fd",
      speedMultiplier: 0.75,
    },
  },
  {
    id: "satellite-3",
    name: "Surveyor-3",
    type: "satellite",
    radius: 0.06,
    color: "#86efac",
    selectedColor: "#22c55e",
    orbit: {
      radius: 2.6,
      inclinationDeg: 70,
      angularOffsetDeg: 250,
      color: "#86efac",
      speedMultiplier: 1.2,
    },
  },
];

