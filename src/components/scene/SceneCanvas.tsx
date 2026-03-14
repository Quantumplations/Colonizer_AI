import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Vector3Tuple } from "three";
import Earth from "./Earth";
import OrbitPath from "./OrbitPath";
import Satellite from "./Satellite";
import { useSimStore } from "../../store/simStore";
import { EARTH_CONFIG, PRIMARY_SATELLITE } from "../../config/simConfig";
import { getOrbitState } from "../../lib/orbit";
import SceneLighting from "./SceneLighting";
import SpaceBackground from "./SpaceBackground";

function SimulationDriver() {
  const tick = useSimStore((state) => state.tick);

  useFrame((_, delta) => {
    tick(delta);
  });

  return null;
}

function SceneContents() {
  const clearSelection = useSimStore((state) => state.clearSelection);

  return (
    <group onPointerMissed={() => clearSelection()}>
      <SceneLighting />
      <SpaceBackground />
      <Earth earth={EARTH_CONFIG} />
      <OrbitPath orbit={PRIMARY_SATELLITE.orbit} />
      <Satellite satellite={PRIMARY_SATELLITE} />
    </group>
  );
}

function CameraCommandHandler({
  controlsRef,
}: {
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
}) {
  const cameraCommand = useSimStore((state) => state.cameraCommand);
  const simTime = useSimStore((state) => state.simTime);
  const selectedObjectId = useSimStore((state) => state.selectedObjectId);
  const selectedPosition = useMemo<Vector3Tuple | null>(() => {
    if (selectedObjectId === PRIMARY_SATELLITE.id) {
      return getOrbitState(simTime, PRIMARY_SATELLITE.orbit).position;
    }
    if (selectedObjectId === EARTH_CONFIG.id) {
      return [0, 0, 0];
    }
    return null;
  }, [selectedObjectId, simTime]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !cameraCommand) {
      return;
    }

    if (cameraCommand.type === "reset") {
      controls.target.set(0, 0, 0);
      controls.object.position.set(3.8, 2.3, 4.5);
      controls.update();
      return;
    }

    if (cameraCommand.type === "focusSelected" && selectedPosition) {
      controls.target.set(...selectedPosition);
      controls.object.position.set(
        selectedPosition[0] + 1.6,
        selectedPosition[1] + 1.0,
        selectedPosition[2] + 1.9,
      );
      controls.update();
    }
  }, [cameraCommand, controlsRef, selectedPosition]);

  return null;
}

function SceneCanvas() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <Canvas
      camera={{ position: [3.8, 2.3, 4.5], fov: 48, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#020617"]} />
      <SimulationDriver />
      <CameraCommandHandler controlsRef={controlsRef} />
      <SceneContents />
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
