import type {
  GroundStationConfig,
  OrbitConfig,
  SatelliteConfig,
  SimObjectType,
} from "./sim";
import type {
  MissionPhase,
  MissionPhaseId,
  SubsystemDetailEntry,
  SubsystemStateSummary,
  SystemMode,
  SystemModeId,
  TimelineEvent,
} from "./mission";

export type CelestialBodyType = "earth";

export type CelestialBodyConfig = {
  id: string;
  name: string;
  type: CelestialBodyType;
  radius: number;
  color: string;
  atmosphereColor: string;
  description?: string;
  metadata?: Record<string, string>;
};

export type ScenarioSelectionRef = {
  id: string;
  type: SimObjectType;
};

export type ScenarioUiDefaults = {
  defaultSelection?: ScenarioSelectionRef | null;
  defaultCameraPosition?: [number, number, number];
  defaultCameraTarget?: [number, number, number];
};

export type OperationalScenarioStep = {
  order: number;
  label: string;
  description: string;
  linkedEventIds?: string[];
};

export type OperationalScenario = {
  id: string;
  name: string;
  description: string;
  steps: OperationalScenarioStep[];
  relatedEvents: string[];
  relatedModes: SystemModeId[];
  relatedPhases: MissionPhaseId[];
  successCriteria: string[];
  operatorNotes: string[];
};

export type CommunicationsStrategy = {
  description: string;
  primaryLinks: string[];
  downlinkStrategy: string;
  uplinkStrategy: string;
  contactAssumptions: string[];
  latencyAvailabilityNotes: string[];
  groundSegmentNotes: string[];
};

export type OperationalConstraintCategory =
  | "power"
  | "thermal"
  | "pointing"
  | "communications"
  | "payload"
  | "timeline"
  | "orbitalCoverage"
  | "regulatorySafety";

export type OperationalConstraint = {
  id: string;
  category: OperationalConstraintCategory;
  title: string;
  description: string;
  affectedSubsystems: string[];
  severity: "low" | "medium" | "high";
  mitigationNotes: string[];
};

export type ScenarioGlossaryEntry = {
  term: string;
  definition: string;
};

export type ScenarioReference = {
  title: string;
  source: string;
  note?: string;
};

export type MissionScenario = {
  id: string;
  name: string;
  description: string;
  summary: string;
  missionObjectives: string[];
  assumptions: string[];
  missionDurationSeconds: number;
  missionDurationLabel: string;
  bodies: CelestialBodyConfig[];
  satellites: SatelliteConfig[];
  groundStations: GroundStationConfig[];
  phases: MissionPhase[];
  modes: SystemMode[];
  events: TimelineEvent[];
  subsystemTemplates: SubsystemStateSummary[];
  subsystemDetailsCatalog: SubsystemDetailEntry[];
  subsystemSummariesByMode: Partial<Record<SystemModeId, SubsystemStateSummary[]>>;
  operationalScenarios: OperationalScenario[];
  communicationsStrategy: CommunicationsStrategy;
  operationalConstraints: OperationalConstraint[];
  glossary?: ScenarioGlossaryEntry[];
  references?: ScenarioReference[];
  notes?: string[];
  uiDefaults?: ScenarioUiDefaults;
};

export type OrbitLike = {
  orbit: OrbitConfig;
};

