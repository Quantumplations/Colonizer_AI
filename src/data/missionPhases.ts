import { MissionPhase } from "../types/mission";

export const MISSION_PHASES: MissionPhase[] = [
  {
    id: "preLaunch",
    label: "Pre-Launch",
    shortLabel: "Pre-Launch",
    description: "Vehicle prep and pre-mission validation window.",
    color: "#64748b",
    startTime: 0,
    endTime: 0.08,
  },
  {
    id: "launchAscent",
    label: "Launch & Ascent",
    shortLabel: "Launch",
    description: "Liftoff through insertion staging and ascent operations.",
    color: "#f97316",
    startTime: 0.08,
    endTime: 0.16,
  },
  {
    id: "leop",
    label: "LEOP",
    shortLabel: "LEOP",
    description: "Early Orbit Phase commissioning-critical operations.",
    color: "#eab308",
    startTime: 0.16,
    endTime: 0.28,
  },
  {
    id: "commissioning",
    label: "Commissioning",
    shortLabel: "Comm.",
    description: "Subsystem and payload activation and calibration.",
    color: "#22c55e",
    startTime: 0.28,
    endTime: 0.44,
  },
  {
    id: "nominalOperations",
    label: "Nominal Operations",
    shortLabel: "Nominal",
    description: "Routine mission execution and planned collections.",
    color: "#38bdf8",
    startTime: 0.44,
    endTime: 0.88,
  },
  {
    id: "decommissioning",
    label: "Decommissioning",
    shortLabel: "Decom",
    description: "End-of-life procedures and disposal preparation.",
    color: "#a855f7",
    startTime: 0.88,
    endTime: 1,
  },
];

