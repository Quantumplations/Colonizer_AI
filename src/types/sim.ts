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

export type GroundStationConfig = {
  id: string;
  name: string;
  type: "groundStation";
  latitudeDeg: number;
  longitudeDeg: number;
  color: string;
  radius: number;
};

export type SelectedObjectInfo = {
  id: string;
  type: SimObjectType;
};

export type TimelineEventType = "info" | "maneuver" | "comms";

export type TimelineEvent = {
  id: string;
  label: string;
  time: number;
  relatedObjectId: string | null;
  relatedObjectType: SimObjectType | null;
  type: TimelineEventType;
};

