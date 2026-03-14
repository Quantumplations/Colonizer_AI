import { MutableRefObject, useEffect, useMemo } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useSimStore } from "../../store/simStore";
import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_TARGET,
} from "../../config/simSettings";
import { getObjectWorldPosition } from "../../lib/sceneLookup";
import type { MissionScenario } from "../../types/scenario";

type CameraControllerProps = {
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
  scenario: MissionScenario;
};

function CameraController({ controlsRef, scenario }: CameraControllerProps) {
  const cameraCommand = useSimStore((state) => state.cameraCommand);
  const selectedObjectId = useSimStore((state) => state.selectedObjectId);
  const selectedObjectType = useSimStore((state) => state.selectedObjectType);
  const simTime = useSimStore((state) => state.simTime);

  const selectedPosition = useMemo(
    () =>
      getObjectWorldPosition(
        scenario,
        { id: selectedObjectId, type: selectedObjectType },
        simTime,
      ),
    [scenario, selectedObjectId, selectedObjectType, simTime],
  );

  const resetCameraPosition =
    scenario.uiDefaults?.defaultCameraPosition ?? DEFAULT_CAMERA_POSITION;
  const resetCameraTarget =
    scenario.uiDefaults?.defaultCameraTarget ?? DEFAULT_CAMERA_TARGET;

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !cameraCommand) {
      return;
    }

    if (cameraCommand.type === "reset") {
      controls.target.set(...resetCameraTarget);
      controls.object.position.set(...resetCameraPosition);
      controls.update();
      return;
    }

    if (cameraCommand.type === "focusSelected" && selectedPosition) {
      controls.target.set(...selectedPosition);
      controls.object.position.set(
        selectedPosition[0] + 1.8,
        selectedPosition[1] + 1.1,
        selectedPosition[2] + 2.2,
      );
      controls.update();
    }
  }, [cameraCommand, controlsRef, resetCameraPosition, resetCameraTarget, selectedPosition]);

  return null;
}

export default CameraController;

