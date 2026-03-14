# Colonizer AI

A hackathon project combining a **4D Mission Simulator** frontend with an **ML-powered Alien Colonization Planner** and **3D Star System Simulator**.

---

## Alien_Colonization — ML Colonization Planner

A **Transformer-based neural network** (3.9M parameters) that accepts measurable stellar and planetary parameters and produces a detailed colonization plan, plus an interactive **3D browser-based simulator** (Three.js) that animates the plan.

### Architecture

- **Star Encoder** (MLP) — encodes stellar features (luminosity, temperature, mass, spectral class, metallicity, age, etc.)
- **Planet Encoder** (shared MLP) — encodes per-planet features (orbital params, mass, radius, atmosphere composition, etc.)
- **Cross-Attention Backbone** (4 layers) — planets attend to star context and to each other
- **4 Decoder Heads** — suitability scores, resource classification, colonization timeline, infrastructure recommendations

### Files

| File | Description |
|------|-------------|
| `config.py` | Hyperparameters, feature dimensions, labels |
| `solar_system_data.py` | Real Solar System data (Sun + 8 planets) |
| `data_generator.py` | Synthetic data engine with astrophysical priors + rule-based expert system |
| `model.py` | Transformer model architecture |
| `train.py` | Multi-task training pipeline |
| `inference.py` | Inference + structured plan assembly |
| `main.py` | CLI entry point (train / infer / demo) |
| `simulator.html` | 3D Three.js colonization simulator |

### Usage

```bash
cd Alien_Colonization

# Train the model
python main.py train --epochs 100

# Run inference on our Solar System (from an alien perspective)
python main.py infer

# Full demo: train + infer + open simulator
python main.py demo --epochs 20

# View the 3D simulator
python -m http.server 8080
# Open http://localhost:8080/simulator.html
```

### Solar System Test Results (Alien Perspective)

| Planet | Suitability | Grade | Key Resources |
|--------|------------|-------|---------------|
| Earth | 72.1% | B — Good | Mining, Water, Energy, Construction |
| Mercury | 70.2% | B — Good | Mining, Energy, Construction |
| Mars | 43.8% | C — Moderate | Mining, Atmosphere, Water |
| Venus | 43.3% | C — Moderate | Mining, Energy, Atmosphere |
| Gas Giants | 6-13% | F — Unsuitable | Fuel extraction, Atmosphere harvesting |

### Requirements

- Python 3.8+
- PyTorch
- NumPy

---

## 4D Mission Simulator (Frontend)

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

