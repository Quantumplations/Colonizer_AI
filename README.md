# 4D Mission Simulator - Step 2

Frontend-only mission viewer built with React, TypeScript, Vite, Tailwind, Three.js (R3F), and Zustand.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Quick Debug Notes

- Blank canvas:
  - Confirm the browser console has no WebGL errors.
  - Confirm `Canvas` is mounted and `html/body/#root` are full height.
  - Confirm Vite is running with a compatible Node version.
- Satellites do not appear:
  - Check `showSatellites` toggle in the side panel.
  - Confirm data exists in `src/data/satellites.ts`.
  - Verify position calculation in `getSatelliteOrbitState()` inside `src/lib/orbit.ts`.
- Ground stations are misplaced:
  - Verify lat/lon values in `src/data/groundStations.ts`.
  - Check conversion math in `latLonToCartesian()` inside `src/lib/geo.ts`.
- Selection stops working:
  - Ensure entity meshes call `event.stopPropagation()` in click handlers.
  - Confirm `onPointerMissed` in `SceneObjects` still clears selection.
  - Check store actions in `src/store/simStore.ts`.
- Event markers do not show:
  - Confirm event entries exist in `src/data/events.ts`.
  - Check event marker rendering block in `src/components/ui/TimelineControls.tsx`.
- Camera focus behaves oddly:
  - Verify selected world-position lookup in `src/lib/sceneLookup.ts`.
  - Check focus offsets in `src/components/scene/CameraController.tsx`.
- Orbit line not visible:
  - Check orbit color and opacity in `src/components/scene/OrbitPath.tsx`.
  - Verify generated points from `getOrbitPathPoints()` in `src/lib/orbit.ts`.

