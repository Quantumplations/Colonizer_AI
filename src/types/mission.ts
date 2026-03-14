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
  name: string;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  startTime: number;
  endTime: number;
  objectives: string[];
  majorEvents: string[];
  exitCriteria: string[];
  operationalNotes: string[];
  relatedModes?: SystemModeId[];
  successCriteria?: string[];
};

export type SubsystemDetailEntry = {
  subsystemId: SubsystemId | "obcCdh";
  subsystemName: string;
  statusLabel: string;
  description: string;
  state: string;
  constraints: string[];
  notes?: string[];
  color?: string;
};

export type SystemMode = {
  id: SystemModeId;
  name: string;
  label: string;
  description: string;
  color: string;
  startTime: number;
  endTime: number;
  entryConditions: string[];
  exitConditions: string[];
  operationalPurpose: string;
  subsystemStates: SubsystemDetailEntry[];
  allowedActivities: string[];
  inhibitedActivities: string[];
  operatorNotes: string[];
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
  description?: string;
  objective?: string;
  relatedScenarioId?: string;
  relatedPhaseId?: MissionPhaseId;
  relatedModeId?: SystemModeId;
  operatorNotes?: string[];
  linkedConstraints?: string[];
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

