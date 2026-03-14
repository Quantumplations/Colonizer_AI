import { EarthConfig } from "../../types/sim";
import { useSimStore } from "../../store/simStore";
import { DoubleSide } from "three";

type EarthProps = {
  earth: EarthConfig;
};

function Earth({ earth }: EarthProps) {
  const selectedObjectId = useSimStore((state) => state.selectedObjectId);
  const isSelected = selectedObjectId === earth.id;

  return (
    <group>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          useSimStore.getState().selectObject(earth.id, earth.type);
        }}
      >
        <sphereGeometry args={[earth.radius, 64, 64]} />
        <meshStandardMaterial
          color={earth.color}
          roughness={0.75}
          metalness={0.15}
          emissive={isSelected ? "#0b1a3b" : "#071023"}
          emissiveIntensity={isSelected ? 0.45 : 0.2}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[earth.radius * 1.05, 48, 48]} />
        <meshBasicMaterial
          color={earth.atmosphereColor}
          transparent
          opacity={0.18}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default Earth;
