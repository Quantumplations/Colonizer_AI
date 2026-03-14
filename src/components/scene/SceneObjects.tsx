import Earth from "./Earth";
import OrbitPath from "./OrbitPath";
import Satellite from "./Satellite";
import GroundStation from "./GroundStation";
import SceneLighting from "./SceneLighting";
import SpaceBackground from "./SpaceBackground";
import { useSimStore } from "../../store/simStore";
import type { MissionScenario } from "../../types/scenario";
import {
  getScenarioEarthBody,
  getScenarioGroundStations,
  getScenarioSatellites,
} from "../../lib/scenarioSelectors";

type SceneObjectsProps = {
  scenario: MissionScenario;
};

function SceneObjects({ scenario }: SceneObjectsProps) {
  const clearSelection = useSimStore((state) => state.clearSelection);
  const clearHoveredObject = useSimStore((state) => state.clearHoveredObject);
  const showSatellites = useSimStore((state) => state.showSatellites);
  const showOrbits = useSimStore((state) => state.showOrbits);
  const showGroundStations = useSimStore((state) => state.showGroundStations);
  const earth = getScenarioEarthBody(scenario);
  const satellites = getScenarioSatellites(scenario);
  const groundStations = getScenarioGroundStations(scenario);

  return (
    <group
      onPointerMissed={() => {
        clearSelection();
        clearHoveredObject();
      }}
    >
      <SceneLighting />
      <SpaceBackground />
      {earth ? <Earth earth={earth} /> : null}

      {showOrbits && satellites.length > 0
        ? satellites.map((satellite) => (
            <OrbitPath key={`orbit-${satellite.id}`} orbit={satellite.orbit} />
          ))
        : null}

      {showSatellites && satellites.length > 0
        ? satellites.map((satellite) => (
            <Satellite key={satellite.id} satellite={satellite} scenario={scenario} />
          ))
        : null}

      {showGroundStations && groundStations.length > 0 && earth
        ? groundStations.map((station) => (
            <GroundStation
              key={station.id}
              station={station}
              earthRadius={earth.radius}
            />
          ))
        : null}
    </group>
  );
}

export default SceneObjects;

