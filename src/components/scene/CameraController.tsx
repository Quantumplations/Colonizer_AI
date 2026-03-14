import { MutableRefObject, useEffect, useMemo } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useSimStore } from "../../store/simStore";
import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_TARGET,
} from "../../config/simSettings";
import { getObjectWorldPosition } from "../../lib/sceneLookup";

type CameraControllerProps = {
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
};

function CameraController({ controlsRef }: CameraControllerProps) {
  const cameraCommand = useSimStore((state) => state.cameraCommand);
  const selectedObjectId = useSimStore((state) => state.selectedObjectId);
  const selectedObjectType = useSimStore((state) => state.selectedObjectType);
  const simTime = useSimStore((state) => state.simTime);

  const selectedPosition = useMemo(
    () =>
      getObjectWorldPosition(
        { id: selectedObjectId, type: selectedObjectType },
        simTime,
      ),
    [selectedObjectId, selectedObjectType, simTime],
  );

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !cameraCommand) {
      return;
    }

    if (cameraCommand.type === "reset") {
      controls.target.set(...DEFAULT_CAMERA_TARGET);
      controls.object.position.set(...DEFAULT_CAMERA_POSITION);
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
  }, [cameraCommand, controlsRef, selectedPosition]);

  return null;
}

export default CameraController;

