import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useSimStore } from "../../store/simStore";
import SceneObjects from "./SceneObjects";
import CameraController from "./CameraController";
import { DEFAULT_CAMERA_POSITION } from "../../config/simSettings";

function SimulationDriver() {
  const tick = useSimStore((state) => state.tick);

  useFrame((_, delta) => {
    tick(delta);
  });

  return null;
}

function SceneCanvas() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <Canvas
      camera={{ position: DEFAULT_CAMERA_POSITION, fov: 48, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#020617"]} />
      <SimulationDriver />
      <CameraController controlsRef={controlsRef} />
      <SceneObjects />
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableRotate
        enableZoom
        enableDamping
        dampingFactor={0.08}
        minDistance={1.4}
        maxDistance={14}
      />
    </Canvas>
  );
}

export default SceneCanvas;
