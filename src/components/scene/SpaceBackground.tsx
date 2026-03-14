import { Stars } from "@react-three/drei";

function SpaceBackground() {
  return (
    <Stars
      radius={90}
      depth={40}
      count={2500}
      factor={4}
      saturation={0}
      fade
      speed={0.2}
    />
  );
}

export default SpaceBackground;

