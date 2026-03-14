# 4D Mission Simulator - Step 1

Frontend-only prototype built with React, TypeScript, Vite, Tailwind, Three.js (R3F), and Zustand.

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
- Earth/satellite not visible:
  - Check camera settings in `src/components/scene/SceneCanvas.tsx`.
  - Check object radius/color values in `src/config/simConfig.ts`.
- Orbit line not visible:
  - Check orbit color and opacity in `src/components/scene/OrbitPath.tsx`.
  - Verify generated points from `getOrbitPathPoints()` in `src/lib/orbit.ts`.
- Click selection not firing:
  - Ensure meshes call `event.stopPropagation()` in click handlers.
  - Ensure deselection path is wired with `onPointerMissed`.

