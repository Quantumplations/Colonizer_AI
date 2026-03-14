import { SimObjectType } from "./sim";

export type MissionPhaseId =
  | "preLaunch"
  | "launchAscent"
  | "leop"
  | "commissioning"
  | "nominalOperations"
  | "decommissioning";

export type SystemModeId =
  | "offLaunch"
  | "safe"
  | "nominalScience"
  | "maneuver";

export type MissionPhase = {
  id: MissionPhaseId;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  startTime: number;
  endTime: number;
};

export type SystemMode = {
  id: SystemModeId;
  label: string;
  description: string;
  color: string;
  startTime: number;
  endTime: number;
};

export type MissionTimelineEventType =
  | "requestIntake"
  | "planning"
  | "collection"
  | "downlink"
  | "delivery"
  | "info"
  | "maneuver"
  | "comms";

export type TimelineEvent = {
  id: string;
  label: string;
  startTime: number;
  endTime?: number;
  relatedObjectId: string | null;
  relatedObjectType: SimObjectType | null;
  type: MissionTimelineEventType;
  color?: string;
};

export type SubsystemId = "eps" | "comms" | "aocs" | "payload" | "thermal";
export type SubsystemStatus = "unknown" | "nominal" | "degraded" | "warning";

export type SubsystemStateSummary = {
  id: SubsystemId;
  label: string;
  status: SubsystemStatus;
  summary: string;
  color: string;
};

export type MissionTimelineConfig = {
  id: string;
  name: string;
  totalDurationSeconds: number;
  referenceLabel: string;
};

