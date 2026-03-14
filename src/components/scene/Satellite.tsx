import { useMemo } from "react";
import { getOrbitState } from "../../lib/orbit";
import { useSimStore } from "../../store/simStore";
import { SatelliteConfig } from "../../types/sim";

type SatelliteProps = {
  satellite: SatelliteConfig;
};

function Satellite({ satellite }: SatelliteProps) {
  const simTime = useSimStore((state) => state.simTime);
  const selectedObjectId = useSimStore((state) => state.selectedObjectId);
  const selectObject = useSimStore((state) => state.selectObject);

  const orbitState = useMemo(
    () => getOrbitState(simTime, satellite.orbit),
    [simTime, satellite.orbit],
  );
  const isSelected = selectedObjectId === satellite.id;

  return (
    <group position={orbitState.position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          selectObject(satellite.id, satellite.type);
        }}
      >
        <sphereGeometry args={[satellite.radius, 18, 18]} />
        <meshStandardMaterial
          color={isSelected ? satellite.selectedColor : satellite.color}
          emissive={isSelected ? "#fb923c" : "#dbeafe"}
          emissiveIntensity={isSelected ? 0.75 : 0.2}
          roughness={0.25}
          metalness={0.6}
        />
      </mesh>

      {isSelected ? (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[satellite.radius * 1.45, satellite.radius * 1.7, 48]} />
          <meshBasicMaterial color="#fb923c" transparent opacity={0.9} />
        </mesh>
      ) : null}
    </group>
  );
}

export default Satellite;
