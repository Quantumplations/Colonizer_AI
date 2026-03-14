import { create } from "zustand";
import {
  advanceNormalizedTime,
  clamp01,
  getFrameIndependentDelta,
} from "../lib/time";
import {
  DEFAULT_PLAYBACK_SPEED,
  MAX_SIM_DELTA_SECONDS,
} from "../config/simConfig";
import { SimObjectType } from "../types/sim";

type CameraCommandType = "reset" | "focusSelected";

type CameraCommand = {
  type: CameraCommandType;
  nonce: number;
};

type SimStoreState = {
  simTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  selectedObjectId: string | null;
  selectedObjectType: SimObjectType | null;
  cameraCommand: CameraCommand | null;
};

type SimStoreActions = {
  setSimTime: (time: number) => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
  selectObject: (id: string, type: SimObjectType) => void;
  clearSelection: () => void;
  requestCameraCommand: (type: CameraCommandType) => void;
  tick: (deltaSeconds: number) => void;
};

type SimStore = SimStoreState & SimStoreActions;

export const useSimStore = create<SimStore>((set) => ({
  simTime: 0,
  isPlaying: false,
  playbackSpeed: DEFAULT_PLAYBACK_SPEED,
  selectedObjectId: null,
  selectedObjectType: null,
  cameraCommand: null,
  setSimTime: (time) =>
    set({
      simTime: clamp01(time),
    }),
  togglePlay: () =>
    set((state) => ({
      isPlaying: !state.isPlaying,
    })),
  setPlaybackSpeed: (speed) =>
    set({
      playbackSpeed: speed,
    }),
  selectObject: (id, type) =>
    set({
      selectedObjectId: id,
      selectedObjectType: type,
    }),
  clearSelection: () =>
    set({
      selectedObjectId: null,
      selectedObjectType: null,
    }),
  requestCameraCommand: (type) =>
    set((state) => ({
      cameraCommand: {
        type,
        nonce: (state.cameraCommand?.nonce ?? 0) + 1,
      },
    })),
  tick: (deltaSeconds) =>
    set((state) => {
      if (!state.isPlaying) {
        return state;
      }

      return {
        simTime: advanceNormalizedTime(
          state.simTime,
          getFrameIndependentDelta(
            deltaSeconds,
            state.playbackSpeed,
            MAX_SIM_DELTA_SECONDS,
          ),
        ),
      };
    }),
}));
