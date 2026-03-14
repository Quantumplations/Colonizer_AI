import { useMemo } from "react";
import type { GroundStationConfig } from "../../types/sim";
import { latLonToCartesian } from "../../lib/geo";
import { useSimStore } from "../../store/simStore";
import ObjectLabel from "./ObjectLabel";

type GroundStationProps = {
  station: GroundStationConfig;
  earthRadius: number;
};

function GroundStation({ station, earthRadius }: GroundStationProps) {
  const selectedObjectId = useSimStore((state) => state.selectedObjectId);
  const hoveredObjectId = useSimStore((state) => state.hoveredObjectId);
  const selectObject = useSimStore((state) => state.selectObject);
  const setHoveredObject = useSimStore((state) => state.setHoveredObject);
  const clearHoveredObject = useSimStore((state) => state.clearHoveredObject);
  const showLabels = useSimStore((state) => state.showLabels);

  const position = useMemo(
    () =>
      latLonToCartesian(
        station.latitudeDeg,
        station.longitudeDeg,
        earthRadius + station.radius * 0.65,
      ),
    [earthRadius, station.latitudeDeg, station.longitudeDeg, station.radius],
  );

  const isSelected = selectedObjectId === station.id;
  const isHovered = hoveredObjectId === station.id;
  const showLabel = showLabels && (isSelected || isHovered);

  return (
    <group position={position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          selectObject(station.id, station.type);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHoveredObject(station.id, station.type);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          clearHoveredObject();
        }}
      >
        <sphereGeometry args={[station.radius, 12, 12]} />
        <meshStandardMaterial
          color={station.color}
          emissive={isSelected ? station.color : "#000000"}
          emissiveIntensity={isSelected ? 0.8 : 0}
        />
      </mesh>
      {showLabel ? <ObjectLabel text={station.name} /> : null}
    </group>
  );
}

export default GroundStation;

