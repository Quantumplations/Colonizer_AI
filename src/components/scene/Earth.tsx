import { EarthConfig } from "../../types/sim";
import { useSimStore } from "../../store/simStore";
import { DoubleSide } from "three";
import ObjectLabel from "./ObjectLabel";

type EarthProps = {
  earth: EarthConfig;
};

function Earth({ earth }: EarthProps) {
  const selectedObjectId = useSimStore((state) => state.selectedObjectId);
  const hoveredObjectId = useSimStore((state) => state.hoveredObjectId);
  const showLabels = useSimStore((state) => state.showLabels);
  const setHoveredObject = useSimStore((state) => state.setHoveredObject);
  const clearHoveredObject = useSimStore((state) => state.clearHoveredObject);
  const selectObject = useSimStore((state) => state.selectObject);
  const isSelected = selectedObjectId === earth.id;
  const isHovered = hoveredObjectId === earth.id;
  const showLabel = showLabels && (isHovered || isSelected);

  return (
    <group>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          selectObject(earth.id, earth.type);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHoveredObject(earth.id, earth.type);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          clearHoveredObject();
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

      {showLabel ? <ObjectLabel text={earth.name} position={[0, 1.2, 0]} /> : null}
    </group>
  );
}

export default Earth;
