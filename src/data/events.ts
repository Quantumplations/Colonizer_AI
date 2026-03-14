import { TimelineEvent } from "../types/sim";

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "evt-1",
    label: "Explorer-1 Acquisition",
    time: 0.12,
    relatedObjectId: "satellite-1",
    relatedObjectType: "satellite",
    type: "comms",
  },
  {
    id: "evt-2",
    label: "Aurora-2 Orbit Check",
    time: 0.36,
    relatedObjectId: "satellite-2",
    relatedObjectType: "satellite",
    type: "info",
  },
  {
    id: "evt-3",
    label: "Surveyor-3 Maneuver Window",
    time: 0.62,
    relatedObjectId: "satellite-3",
    relatedObjectType: "satellite",
    type: "maneuver",
  },
  {
    id: "evt-4",
    label: "Canberra Downlink",
    time: 0.84,
    relatedObjectId: "station-canberra",
    relatedObjectType: "groundStation",
    type: "comms",
  },
];

