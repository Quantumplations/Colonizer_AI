import { useMemo, useState } from "react";
import type {
  MissionScenario,
  OperationalConstraintCategory,
} from "../../../types/scenario";
import DetailSection from "./DetailSection";

type ConstraintsTabProps = {
  scenario: MissionScenario;
};

const ALL_CATEGORIES = "all";

function ConstraintsTab({ scenario }: ConstraintsTabProps) {
  const constraints = scenario.operationalConstraints ?? [];
  const [activeCategory, setActiveCategory] = useState<
    OperationalConstraintCategory | typeof ALL_CATEGORIES
  >(ALL_CATEGORIES);

  const categories = useMemo(() => {
    return Array.from(new Set(constraints.map((constraint) => constraint.category))).sort();
  }, [constraints]);

  const visibleConstraints = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES) {
      return constraints;
    }
    return constraints.filter((constraint) => constraint.category === activeCategory);
  }, [activeCategory, constraints]);

  return (
    <div className="space-y-3">
      <DetailSection title="Operational Constraints">
        <div className="mb-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(ALL_CATEGORIES)}
            className={`rounded px-2 py-1 text-xs ${
              activeCategory === ALL_CATEGORIES
                ? "bg-sky-600 text-white"
                : "border border-slate-700 text-slate-300"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded px-2 py-1 text-xs ${
                activeCategory === category
                  ? "bg-sky-600 text-white"
                  : "border border-slate-700 text-slate-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {visibleConstraints.length === 0 ? (
          <div className="text-sm text-slate-400">No constraints in this category.</div>
        ) : (
          <div className="space-y-2">
            {visibleConstraints.map((constraint) => (
              <article key={constraint.id} className="rounded border border-slate-800 p-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-100">{constraint.title}</div>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase text-slate-300">
                    {constraint.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{constraint.category}</div>
                <p className="mt-1 text-sm text-slate-300">{constraint.description}</p>
                <div className="mt-1 text-xs text-slate-400">
                  Affected: {constraint.affectedSubsystems.join(", ")}
                </div>
                {constraint.mitigationNotes.length > 0 ? (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-300">
                    {constraint.mitigationNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </DetailSection>
    </div>
  );
}

export default ConstraintsTab;

