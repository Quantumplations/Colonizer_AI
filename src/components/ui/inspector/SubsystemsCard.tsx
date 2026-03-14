import type { SubsystemDetailEntry, SubsystemStateSummary } from "../../../types/mission";
import DetailSection from "./DetailSection";

type SubsystemsCardProps = {
  subsystemSummary: SubsystemStateSummary[];
  modeSubsystemDetails: SubsystemDetailEntry[];
};

function SubsystemsCard({
  subsystemSummary,
  modeSubsystemDetails,
}: SubsystemsCardProps) {
  return (
    <DetailSection title="Subsystems">
      <div className="space-y-2">
        {subsystemSummary.length === 0 && modeSubsystemDetails.length === 0 ? (
          <div className="text-xs text-slate-400">No subsystem details available.</div>
        ) : null}

        {subsystemSummary.map((summary) => {
          const detail = modeSubsystemDetails.find(
            (entry) =>
              entry.subsystemId === summary.id || entry.subsystemName === summary.label,
          );
          return (
            <article key={summary.id} className="rounded border border-slate-800 p-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-100">{summary.label}</div>
                <span
                  className="rounded px-2 py-0.5 text-[10px] font-semibold text-slate-950"
                  style={{ backgroundColor: summary.color }}
                >
                  {summary.status.toUpperCase()}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-300">{summary.summary}</div>
              {detail ? (
                <div className="mt-2 space-y-1 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400">State: </span>
                    {detail.state}
                  </div>
                  <div>{detail.description}</div>
                  {detail.constraints.length > 0 ? (
                    <ul className="list-disc space-y-0.5 pl-4">
                      {detail.constraints.map((constraint) => (
                        <li key={constraint}>{constraint}</li>
                      ))}
                    </ul>
                  ) : null}
                  {detail.notes && detail.notes.length > 0 ? (
                    <div className="text-slate-400">
                      Notes: {detail.notes.join("; ")}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </DetailSection>
  );
}

export default SubsystemsCard;

