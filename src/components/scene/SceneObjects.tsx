import Earth from "./Earth";
import OrbitPath from "./OrbitPath";
import Satellite from "./Satellite";
import GroundStation from "./GroundStation";
import SceneLighting from "./SceneLighting";
import SpaceBackground from "./SpaceBackground";
import { EARTH, GROUND_STATIONS, SATELLITES } from "../../data";
import { useSimStore } from "../../store/simStore";

function SceneObjects() {
  const clearSelection = useSimStore((state) => state.clearSelection);
  const clearHoveredObject = useSimStore((state) => state.clearHoveredObject);
  const showSatellites = useSimStore((state) => state.showSatellites);
  const showOrbits = useSimStore((state) => state.showOrbits);
  const showGroundStations = useSimStore((state) => state.showGroundStations);

  return (
    <group
      onPointerMissed={() => {
        clearSelection();
        clearHoveredObject();
      }}
    >
      <SceneLighting />
      <SpaceBackground />
      <Earth earth={EARTH} />

      {showOrbits
        ? SATELLITES.map((satellite) => (
            <OrbitPath key={`orbit-${satellite.id}`} orbit={satellite.orbit} />
          ))
        : null}

      {showSatellites
        ? SATELLITES.map((satellite) => (
            <Satellite key={satellite.id} satellite={satellite} />
          ))
        : null}

      {showGroundStations
        ? GROUND_STATIONS.map((station) => (
            <GroundStation
              key={station.id}
              station={station}
              earthRadius={EARTH.radius}
            />
          ))
        : null}
    </group>
  );
}

export default SceneObjects;

