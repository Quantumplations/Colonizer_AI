import { useEffect, useMemo, useState } from "react";
import MainLayout from "./components/layout/MainLayout";
import {
  DEFAULT_SCENARIO_ID,
  getDefaultScenario,
  getScenarioById,
} from "./data";
import { useSimStore } from "./store/simStore";

function App() {
  const [activeScenarioId] = useState(DEFAULT_SCENARIO_ID);
  const setActiveScenarioId = useSimStore((state) => state.setActiveScenarioId);
  const clearSelection = useSimStore((state) => state.clearSelection);
  const clearHoveredObject = useSimStore((state) => state.clearHoveredObject);
  const scenario = useMemo(
    () => getScenarioById(activeScenarioId) ?? getDefaultScenario(),
    [activeScenarioId],
  );
  useEffect(() => {
    setActiveScenarioId(scenario.id);
    clearSelection();
    clearHoveredObject();
  }, [scenario.id, clearHoveredObject, clearSelection, setActiveScenarioId]);

  return <MainLayout scenario={scenario} />;
}

export default App;
