import type { ReactNode } from "react";

export type InspectorTabId =
  | "overview"
  | "currentState"
  | "selectedObject"
  | "scenarios"
  | "constraints"
  | "communications";

type InspectorTab = {
  id: InspectorTabId;
  label: string;
  icon?: ReactNode;
};

const INSPECTOR_TABS: InspectorTab[] = [
  { id: "overview", label: "Overview" },
  { id: "currentState", label: "Current State" },
  { id: "selectedObject", label: "Selected Object" },
  { id: "scenarios", label: "Scenarios" },
  { id: "constraints", label: "Constraints" },
  { id: "communications", label: "Comms" },
];

type InspectorTabsProps = {
  activeTab: InspectorTabId;
  onChange: (tab: InspectorTabId) => void;
};

function InspectorTabs({ activeTab, onChange }: InspectorTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {INSPECTOR_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded border px-2 py-1 text-xs ${
            activeTab === tab.id
              ? "border-sky-500 bg-sky-600/70 text-white"
              : "border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default InspectorTabs;

