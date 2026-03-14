import { useMemo } from "react";
import { getSatelliteOrbitState } from "../../lib/orbit";
import { useSimStore } from "../../store/simStore";
import { SatelliteConfig } from "../../types/sim";
import ObjectLabel from "./ObjectLabel";
import { getCurrentMissionSnapshot } from "../../lib/missionTimeline";

type SatelliteProps = {
  satellite: SatelliteConfig;
};

function Satellite({ satellite }: SatelliteProps) {
  const simTime = useSimStore((state) => state.simTime);
  const selectedObjectId = useSimStore((state) => state.selectedObjectId);
  const hoveredObjectId = useSimStore((state) => state.hoveredObjectId);
  const showLabels = useSimStore((state) => state.showLabels);
  const selectObject = useSimStore((state) => state.selectObject);
  const setHoveredObject = useSimStore((state) => state.setHoveredObject);
  const clearHoveredObject = useSimStore((state) => state.clearHoveredObject);

  const orbitState = useMemo(
    () => getSatelliteOrbitState(simTime, satellite.orbit),
    [simTime, satellite.orbit],
  );
  const modeColor = getCurrentMissionSnapshot(simTime).activeMode.color;
  const isSelected = selectedObjectId === satellite.id;
  const isHovered = hoveredObjectId === satellite.id;
  const showLabel = showLabels && (isSelected || isHovered);

  return (
    <group position={orbitState.position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          selectObject(satellite.id, satellite.type);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHoveredObject(satellite.id, satellite.type);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          clearHoveredObject();
        }}
      >
        <sphereGeometry args={[satellite.radius, 18, 18]} />
        <meshStandardMaterial
          color={isSelected ? modeColor : satellite.color}
          emissive={isSelected ? modeColor : "#dbeafe"}
          emissiveIntensity={isSelected ? 0.55 : 0.2}
          roughness={0.25}
          metalness={0.6}
        />
      </mesh>

      {isSelected ? (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[satellite.radius * 1.45, satellite.radius * 1.7, 48]} />
          <meshBasicMaterial color={modeColor} transparent opacity={0.9} />
        </mesh>
      ) : null}

      {showLabel ? <ObjectLabel text={satellite.name} /> : null}
    </group>
  );
}

export default Satellite;
