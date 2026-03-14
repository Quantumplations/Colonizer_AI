import { useSimStore } from "../../store/simStore";
import { getCurrentMissionSnapshot } from "../../lib/missionTimeline";

function ModeBadge() {
  const simTime = useSimStore((state) => state.simTime);
  const snapshot = getCurrentMissionSnapshot(simTime);

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-20 rounded border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs">
      <div className="text-slate-400">Mission Mode</div>
      <div className="mt-1 flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: snapshot.activeMode.color }}
        />
        <span className="font-semibold text-slate-100">{snapshot.activeMode.label}</span>
      </div>
    </div>
  );
}

export default ModeBadge;

