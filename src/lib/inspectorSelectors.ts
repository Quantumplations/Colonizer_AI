import type { MissionSnapshot } from "./missionTimeline";
import {
  getScenarioConstraintById,
  getScenarioObjectDisplayName,
  getScenarioOperationalScenarioById,
  getScenarioPhaseById,
  getScenarioModeById,
  getScenarioBodyById,
  getScenarioSatelliteById,
  getScenarioGroundStationById,
} from "./scenarioSelectors";
import type { MissionScenario } from "../types/scenario";
import type { SelectionRef } from "./selection";
import { getSatelliteOrbitState } from "./orbit";
import { formatNormalizedTime } from "./time";

export function formatEventTimeRange(startTime: number, endTime?: number): string {
  const start = formatNormalizedTime(startTime);
  if (typeof endTime !== "number") {
    return start;
  }
  return `${start} -> ${formatNormalizedTime(endTime)}`;
}

export function getEventInspectorDetails(
  scenario: MissionScenario,
  snapshot: MissionSnapshot,
) {
  return snapshot.activeEvents.map((event) => ({
    id: event.id,
    label: event.label,
    type: event.type,
    timeRange: formatEventTimeRange(event.startTime, event.endTime),
    description: event.description ?? "No description available.",
    objective: event.objective ?? "No objective provided.",
    relatedScenario:
      event.relatedScenarioId
        ? getScenarioOperationalScenarioById(scenario, event.relatedScenarioId)?.name ??
          event.relatedScenarioId
        : "None",
    relatedPhase:
      event.relatedPhaseId
        ? getScenarioPhaseById(scenario, event.relatedPhaseId)?.label ?? event.relatedPhaseId
        : "None",
    relatedMode:
      event.relatedModeId
        ? getScenarioModeById(scenario, event.relatedModeId)?.label ?? event.relatedModeId
        : "None",
    linkedConstraints:
      event.linkedConstraints?.map(
        (constraintId) =>
          getScenarioConstraintById(scenario, constraintId)?.title ?? constraintId,
      ) ?? [],
    operatorNotes: event.operatorNotes ?? [],
  }));
}

export function getNextEventInspectorPreview(
  scenario: MissionScenario,
  snapshot: MissionSnapshot,
) {
  if (!snapshot.nextEvent) {
    return null;
  }
  const event = snapshot.nextEvent;
  return {
    id: event.id,
    label: event.label,
    type: event.type,
    timeRange: formatEventTimeRange(event.startTime, event.endTime),
    relatedPhase:
      event.relatedPhaseId
        ? getScenarioPhaseById(scenario, event.relatedPhaseId)?.label ?? event.relatedPhaseId
        : "None",
    relatedMode:
      event.relatedModeId
        ? getScenarioModeById(scenario, event.relatedModeId)?.label ?? event.relatedModeId
        : "None",
  };
}

export function getSelectedObjectInspectorData(
  scenario: MissionScenario,
  selection: SelectionRef,
  simTime: number,
) {
  if (!selection.id || !selection.type) {
    return {
      name: "Nothing selected",
      type: "None",
      description: "Select a scene object to inspect details.",
      details: [] as Array<{ label: string; value: string }>,
      capabilities: [] as string[],
      metadata: {} as Record<string, string>,
    };
  }

  if (selection.type === "earth") {
    const body = getScenarioBodyById(scenario, selection.id);
    return {
      name: body?.name ?? selection.id,
      type: "Body",
      description: body?.description ?? "No description available.",
      details: [
        { label: "Radius", value: String(body?.radius ?? "n/a") },
        { label: "Type", value: body?.type ?? "unknown" },
      ],
      capabilities: [],
      metadata: body?.metadata ?? {},
    };
  }

  if (selection.type === "satellite") {
    const satellite = getScenarioSatelliteById(scenario, selection.id);
    const position = satellite
      ? getSatelliteOrbitState(simTime, satellite.orbit).position
      : null;
    return {
      name: satellite?.name ?? selection.id,
      type: "Satellite",
      description: satellite?.description ?? "No description available.",
      details: [
        {
          label: "Orbit Radius",
          value: satellite ? satellite.orbit.radius.toFixed(2) : "n/a",
        },
        {
          label: "Inclination",
          value: satellite ? `${satellite.orbit.inclinationDeg} deg` : "n/a",
        },
        {
          label: "Angular Offset",
          value: satellite ? `${satellite.orbit.angularOffsetDeg} deg` : "n/a",
        },
        {
          label: "Current Position",
          value: position
            ? `x:${position[0].toFixed(3)} y:${position[1].toFixed(3)} z:${position[2].toFixed(3)}`
            : "n/a",
        },
      ],
      capabilities: satellite?.capabilities ?? [],
      metadata: satellite?.metadata ?? {},
    };
  }

  const station = getScenarioGroundStationById(scenario, selection.id);
  const selectionRef = { id: selection.id, type: selection.type as "groundStation" };
  return {
    name: station?.name ?? selection.id,
    type: "Ground Station",
    description: station?.description ?? "No description available.",
    details: [
      { label: "Latitude", value: station ? station.latitudeDeg.toFixed(4) : "n/a" },
      { label: "Longitude", value: station ? station.longitudeDeg.toFixed(4) : "n/a" },
      {
        label: "Display Name",
        value: getScenarioObjectDisplayName(scenario, selectionRef),
      },
    ],
    capabilities: station?.capabilities ?? [],
    metadata: station?.metadata ?? {},
  };
}

