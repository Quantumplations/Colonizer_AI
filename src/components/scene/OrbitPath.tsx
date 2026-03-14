import { Line } from "@react-three/drei";
import { useMemo } from "react";
import { getOrbitPathPoints } from "../../lib/orbit";
import { OrbitConfig } from "../../types/sim";

type OrbitPathProps = {
  orbit: OrbitConfig;
};

function OrbitPath({ orbit }: OrbitPathProps) {
  const points = useMemo(() => {
    return getOrbitPathPoints(orbit, 160);
  }, [orbit]);

  return (
    <Line
      points={points}
      color={orbit.color}
      lineWidth={1.5}
      transparent
      opacity={0.85}
    />
  );
}

export default OrbitPath;
