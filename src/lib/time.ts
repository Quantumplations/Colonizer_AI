const DEFAULT_MISSION_DURATION_SECONDS = 24 * 60 * 60;

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
  missionDurationSeconds = DEFAULT_MISSION_DURATION_SECONDS,
): string {
  const totalSeconds = Math.floor(clamp01(normalizedTime) * missionDurationSeconds);
  const weeks = Math.floor(totalSeconds / (7 * 24 * 60 * 60));
  const days = Math.floor((totalSeconds % (7 * 24 * 60 * 60)) / (24 * 60 * 60));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  if (weeks > 0) {
    const weekHours = String(
      Math.floor((totalSeconds % (24 * 60 * 60)) / 3600),
    ).padStart(2, "0");
    return `T+${weeks}w ${days}d ${weekHours}h ${minutes}m`;
  }

  if (days > 0) {
    const dayHours = String(Math.floor((totalSeconds % (24 * 60 * 60)) / 3600)).padStart(
      2,
      "0",
    );
    return `T+${days}d ${dayHours}h ${minutes}m ${seconds}s`;
  }

  return `T+${hours}h ${minutes}m ${seconds}s`;
}

export function formatMissionDurationSummary(
  missionDurationSeconds = DEFAULT_MISSION_DURATION_SECONDS,
): string {
  const totalDays = missionDurationSeconds / (24 * 60 * 60);
  const totalWeeks = totalDays / 7;
  if (totalWeeks >= 1) {
    return `${totalDays.toFixed(0)}d (${totalWeeks.toFixed(1)}w)`;
  }
  return `${totalDays.toFixed(1)}d`;
}
