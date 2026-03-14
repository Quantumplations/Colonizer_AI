import { SubsystemStateSummary, SystemModeId } from "../types/mission";

export const SUBSYSTEM_STATE_TEMPLATES: SubsystemStateSummary[] = [
  {
    id: "eps",
    label: "EPS",
    status: "nominal",
    summary: "Power bus stable, battery margins healthy.",
    color: "#22c55e",
  },
  {
    id: "comms",
    label: "COMMS",
    status: "nominal",
    summary: "Link margin acceptable for scheduled downlinks.",
    color: "#38bdf8",
  },
  {
    id: "aocs",
    label: "AOCS",
    status: "nominal",
    summary: "Attitude control stable in routine profile.",
    color: "#22c55e",
  },
  {
    id: "payload",
    label: "PAYLOAD",
    status: "unknown",
    summary: "Payload activity placeholder for upcoming mission logic.",
    color: "#94a3b8",
  },
  {
    id: "thermal",
    label: "THERMAL",
    status: "nominal",
    summary: "Thermal sensors within operational bounds.",
    color: "#f59e0b",
  },
];

export const SUBSYSTEM_SUMMARIES_BY_MODE: Record<
  SystemModeId,
  SubsystemStateSummary[]
> = {
  offLaunch: [
    {
      id: "eps",
      label: "EPS",
      status: "nominal",
      summary: "Launch bus power available, non-essential loads disabled.",
      color: "#f97316",
    },
    {
      id: "comms",
      label: "COMMS",
      status: "degraded",
      summary: "Minimal telemetry pathway during ascent profile.",
      color: "#f59e0b",
    },
    {
      id: "aocs",
      label: "AOCS",
      status: "nominal",
      summary: "Launch attitude profile constrained by guidance stack.",
      color: "#22c55e",
    },
    {
      id: "payload",
      label: "PAYLOAD",
      status: "unknown",
      summary: "Payload inhibited until post-insertion operations.",
      color: "#64748b",
    },
    {
      id: "thermal",
      label: "THERMAL",
      status: "nominal",
      summary: "Ascent thermal envelope controlled by launch constraints.",
      color: "#f59e0b",
    },
  ],
  safe: [
    {
      id: "eps",
      label: "EPS",
      status: "nominal",
      summary: "Survival power posture with conservative battery margining.",
      color: "#22c55e",
    },
    {
      id: "comms",
      label: "COMMS",
      status: "degraded",
      summary: "Low-duty comms for health beacons and limited commanding.",
      color: "#f59e0b",
    },
    {
      id: "aocs",
      label: "AOCS",
      status: "warning",
      summary: "Safe-hold attitude hold to protect thermal and power budgets.",
      color: "#f59e0b",
    },
    {
      id: "payload",
      label: "PAYLOAD",
      status: "degraded",
      summary: "Payload off during safe mode recovery posture.",
      color: "#eab308",
    },
    {
      id: "thermal",
      label: "THERMAL",
      status: "nominal",
      summary: "Thermal control prioritizes equipment survival limits.",
      color: "#22c55e",
    },
  ],
  nominalScience: [
    {
      id: "eps",
      label: "EPS",
      status: "nominal",
      summary: "Steady-state generation and charging within planned margins.",
      color: "#22c55e",
    },
    {
      id: "comms",
      label: "COMMS",
      status: "nominal",
      summary: "Scheduled downlink windows and nominal command uplink.",
      color: "#38bdf8",
    },
    {
      id: "aocs",
      label: "AOCS",
      status: "nominal",
      summary: "Target pointing for collection profile operations.",
      color: "#22c55e",
    },
    {
      id: "payload",
      label: "PAYLOAD",
      status: "nominal",
      summary: "Payload active in science/collection duty cycle.",
      color: "#22c55e",
    },
    {
      id: "thermal",
      label: "THERMAL",
      status: "nominal",
      summary: "Thermal gradients managed for sustained operations.",
      color: "#22c55e",
    },
  ],
  maneuver: [
    {
      id: "eps",
      label: "EPS",
      status: "nominal",
      summary: "Power routed for maneuver support and control loads.",
      color: "#22c55e",
    },
    {
      id: "comms",
      label: "COMMS",
      status: "degraded",
      summary: "Command channel priority, payload downlink deferred.",
      color: "#f59e0b",
    },
    {
      id: "aocs",
      label: "AOCS",
      status: "nominal",
      summary: "Maneuver control loop active for burn/attitude profile.",
      color: "#a855f7",
    },
    {
      id: "payload",
      label: "PAYLOAD",
      status: "degraded",
      summary: "Payload inhibited during maneuver operations.",
      color: "#eab308",
    },
    {
      id: "thermal",
      label: "THERMAL",
      status: "warning",
      summary: "Thermal transient monitoring in maneuver configuration.",
      color: "#f59e0b",
    },
  ],
};

