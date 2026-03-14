import { SystemMode } from "../types/mission";

export const SYSTEM_MODES: SystemMode[] = [
  {
    id: "offLaunch",
    label: "OFF / LAUNCH",
    description: "Launch profile mode with limited autonomous payload operation.",
    color: "#f97316",
    startTime: 0,
    endTime: 0.18,
  },
  {
    id: "safe",
    label: "SAFE",
    description: "Conservative safe-hold state with fault recovery posture.",
    color: "#eab308",
    startTime: 0.18,
    endTime: 0.28,
  },
  {
    id: "nominalScience",
    label: "NOMINAL / SCIENCE",
    description: "Primary mission operations and routine data collection.",
    color: "#22c55e",
    startTime: 0.28,
    endTime: 0.82,
  },
  {
    id: "maneuver",
    label: "MANEUVER",
    description: "Attitude or orbit adjustment execution window.",
    color: "#a855f7",
    startTime: 0.82,
    endTime: 1,
  },
];

