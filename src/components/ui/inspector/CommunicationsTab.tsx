import type { MissionScenario } from "../../../types/scenario";
import DetailSection from "./DetailSection";

type CommunicationsTabProps = {
  scenario: MissionScenario;
};

function CommunicationsTab({ scenario }: CommunicationsTabProps) {
  const strategy = scenario.communicationsStrategy;

  if (!strategy) {
    return (
      <DetailSection title="Communications Strategy">
        <div className="text-sm text-slate-400">No communications strategy provided.</div>
      </DetailSection>
    );
  }

  return (
    <div className="space-y-3">
      <DetailSection title="Communications Strategy">
        <p className="text-sm text-slate-300">{strategy.description}</p>
      </DetailSection>

      <DetailSection title="Primary Links">
        <ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">
          {(strategy.primaryLinks ?? []).map((link) => (
            <li key={link}>{link}</li>
          ))}
        </ul>
      </DetailSection>

      <DetailSection title="Downlink / Uplink">
        <div className="space-y-2 text-sm text-slate-300">
          <div>
            <span className="text-xs text-slate-400">Downlink Strategy: </span>
            {strategy.downlinkStrategy || "None"}
          </div>
          <div>
            <span className="text-xs text-slate-400">Uplink Strategy: </span>
            {strategy.uplinkStrategy || "None"}
          </div>
        </div>
      </DetailSection>

      <DetailSection title="Contact Assumptions">
        <ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">
          {(strategy.contactAssumptions ?? []).map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </DetailSection>

      <DetailSection title="Latency / Availability Notes">
        <ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">
          {(strategy.latencyAvailabilityNotes ?? []).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </DetailSection>

      <DetailSection title="Ground Segment Notes">
        <ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">
          {(strategy.groundSegmentNotes ?? []).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </DetailSection>
    </div>
  );
}

export default CommunicationsTab;

