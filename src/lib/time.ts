import { MISSION_DURATION_SECONDS } from "../config/simSettings";

export function clamp01(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

export function advanceNormalizedTime(current: number, delta: number): number {
  const next = current + delta;
  return ((next % 1) + 1) % 1;
}

export function getFrameIndependentDelta(
  deltaSeconds: number,
  speed: number,
  maxDeltaSeconds: number,
): number {
  const safeDelta = Math.min(Math.max(deltaSeconds, 0), maxDeltaSeconds);
  return safeDelta * speed;
}

export function formatNormalizedTime(normalizedTime: number): string {
  return clamp01(normalizedTime).toFixed(3);
}

export function formatMissionElapsedTime(
  normalizedTime: number,
  missionDurationSeconds = MISSION_DURATION_SECONDS,
): string {
  const totalSeconds = Math.floor(clamp01(normalizedTime) * missionDurationSeconds);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `T+${hours}h ${minutes}m ${seconds}s`;
}
