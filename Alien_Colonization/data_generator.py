"""
Colonizer AI — Synthetic Data Generator
Generates realistic star systems using astrophysical priors and computes
ground-truth colonization plans via a rule-based expert system.
"""

import numpy as np
import torch
from torch.utils.data import Dataset

from config import (
    STAR_FEATURE_DIM, PLANET_FEATURE_DIM, MAX_PLANETS,
    SPECTRAL_CLASSES, ATMOSPHERE_GASES, RESOURCE_CLASSES,
    TIMELINE_PHASES, TIMELINE_FEATURES, INFRASTRUCTURE_TYPES,
    SUITABILITY_DIM,
)


# =============================================================================
# Astrophysical Priors
# =============================================================================

SPECTRAL_MASS_RANGES = {
    "O": (16.0, 150.0),
    "B": (2.1, 16.0),
    "A": (1.4, 2.1),
    "F": (1.04, 1.4),
    "G": (0.8, 1.04),
    "K": (0.45, 0.8),
    "M": (0.08, 0.45),
}

SPECTRAL_TEMP_RANGES = {
    "O": (30000, 50000),
    "B": (10000, 30000),
    "A": (7500, 10000),
    "F": (6000, 7500),
    "G": (5200, 6000),
    "K": (3700, 5200),
    "M": (2400, 3700),
}

# Probability of each spectral class (approximating real distribution)
SPECTRAL_PROBS = [0.001, 0.01, 0.03, 0.06, 0.10, 0.15, 0.649]


def generate_random_star(rng=None):
    """Generate a random star dictionary with astrophysically motivated params."""
    if rng is None:
        rng = np.random.default_rng()

    spec_class = rng.choice(SPECTRAL_CLASSES, p=SPECTRAL_PROBS)
    mass_lo, mass_hi = SPECTRAL_MASS_RANGES[spec_class]
    temp_lo, temp_hi = SPECTRAL_TEMP_RANGES[spec_class]

    mass = rng.uniform(mass_lo, mass_hi)
    temp = rng.uniform(temp_lo, temp_hi)
    # Luminosity ≈ M^3.5 (main sequence approximation)
    luminosity = mass ** 3.5
    # Radius ≈ M^0.8
    radius = mass ** 0.8
    metallicity = rng.normal(0.0, 0.3)
    age = rng.uniform(0.1, 12.0)
    ra = rng.uniform(0, 360)
    dec = rng.uniform(-90, 90)
    distance = rng.exponential(100)  # pc

    return {
        "name": f"SYNTH-{rng.integers(100000):05d}",
        "luminosity_solar": float(luminosity),
        "effective_temp_K": float(temp),
        "mass_solar": float(mass),
        "radius_solar": float(radius),
        "spectral_class": spec_class,
        "metallicity_fe_h": float(metallicity),
        "age_gyr": float(age),
        "ra_deg": float(ra),
        "dec_deg": float(dec),
        "distance_pc": float(distance),
    }


def generate_random_planet(star, index, rng=None):
    """Generate a random planet conditioned on the host star."""
    if rng is None:
        rng = np.random.default_rng()

    # Semi-major axis: roughly log-uniform, scaled by star mass
    sma = rng.lognormal(np.log(0.3 + index * 0.8), 0.5) * (star["mass_solar"] ** 0.5)
    sma = max(0.05, min(sma, 100.0))

    ecc = rng.beta(1.5, 10)  # Most orbits are nearly circular
    inc = abs(rng.normal(0, 5))
    period = sma ** 1.5 / (star["mass_solar"] ** 0.5)  # Kepler's third law

    # Planet type based on distance
    if sma < 2.0:
        # Rocky planet
        mass = rng.lognormal(np.log(0.5), 0.8)
        mass = max(0.01, min(mass, 10.0))
        radius = mass ** 0.27  # Rough scaling for rocky
        density = rng.uniform(3.0, 6.0)
    else:
        # Gas/ice giant
        mass = rng.lognormal(np.log(50.0), 1.2)
        mass = max(5.0, min(mass, 5000.0))
        radius = 3.0 + rng.uniform(0, 10.0) * (mass / 300.0) ** 0.1
        density = rng.uniform(0.5, 2.0)

    # Surface temperature from stellar flux
    flux = star["luminosity_solar"] / (sma ** 2)
    base_temp = 278 * (flux ** 0.25)  # equilibrium temp
    surface_temp = base_temp * rng.uniform(0.8, 1.5)  # greenhouse effects

    surface_gravity = mass / (radius ** 2) * 9.81

    has_mag = bool(rng.random() < 0.4)
    has_rings = bool(rng.random() < (0.3 if mass > 10 else 0.02))
    num_moons = int(rng.poisson(mass ** 0.3))

    # Atmosphere composition
    if mass < 3.0:
        # Rocky atmosphere
        co2 = rng.uniform(0, 0.97)
        n2 = rng.uniform(0, 1.0 - co2)
        o2 = rng.uniform(0, 1.0 - co2 - n2)
        remaining = max(0, 1.0 - co2 - n2 - o2)
        h2o = rng.uniform(0, remaining)
        ar = max(0, remaining - h2o)
        atm = {"H2": 0.0, "He": 0.0, "N2": n2, "O2": o2,
               "CO2": co2, "H2O": h2o, "CH4": 0.0, "Ar": ar}
    else:
        # Gas giant atmosphere
        h2 = rng.uniform(0.7, 0.96)
        he = rng.uniform(0.02, 1.0 - h2)
        ch4 = rng.uniform(0, 0.03)
        remaining = max(0, 1.0 - h2 - he - ch4)
        atm = {"H2": h2, "He": he, "N2": 0.0, "O2": 0.0,
               "CO2": 0.0, "H2O": remaining * 0.5, "CH4": ch4, "Ar": 0.0}

    return {
        "name": f"Planet-{index+1}",
        "semi_major_axis_au": float(sma),
        "eccentricity": float(ecc),
        "inclination_deg": float(inc),
        "orbital_period_yr": float(period),
        "mass_earth": float(mass),
        "radius_earth": float(radius),
        "mean_density_gcc": float(density),
        "surface_temp_K": float(surface_temp),
        "surface_gravity_ms2": float(surface_gravity),
        "has_magnetic_field": has_mag,
        "has_rings": has_rings,
        "num_moons": int(num_moons),
        "atmosphere": atm,
    }


def generate_star_system(rng=None):
    """Generate a complete star system with random star + planets."""
    if rng is None:
        rng = np.random.default_rng()

    star = generate_random_star(rng)
    n_planets = rng.integers(1, MAX_PLANETS + 1)
    planets = [generate_random_planet(star, i, rng) for i in range(n_planets)]
    return star, planets


# =============================================================================
# Rule-Based Expert System for Ground-Truth Colonization Plans
# =============================================================================

def compute_suitability(star, planet):
    """Compute a suitability score (0-1) for colonizing a planet."""
    score = 0.0

    # Temperature suitability (prefer 200-350 K)
    t = planet["surface_temp_K"]
    if 250 <= t <= 320:
        score += 0.3
    elif 200 <= t <= 400:
        score += 0.15
    else:
        score += max(0, 0.1 - abs(t - 288) / 5000)

    # Gravity suitability (prefer 3-15 m/s²)
    g = planet["surface_gravity_ms2"]
    if 5 <= g <= 12:
        score += 0.2
    elif 2 <= g <= 20:
        score += 0.1

    # Atmosphere: presence of useful gases
    atm = planet["atmosphere"]
    if atm.get("O2", 0) > 0.1:
        score += 0.15
    if atm.get("N2", 0) > 0.5:
        score += 0.1
    if atm.get("H2O", 0) > 0.001:
        score += 0.1

    # Magnetic field protection
    if planet["has_magnetic_field"]:
        score += 0.05

    # Size penalty for gas giants
    if planet["mass_earth"] > 10:
        score *= 0.3

    # Distance from star — prefer inner system for logistics
    if planet["semi_major_axis_au"] < 3:
        score += 0.05
    elif planet["semi_major_axis_au"] > 20:
        score -= 0.05

    return float(np.clip(score, 0.0, 1.0))


def compute_resources(planet):
    """Compute resource availability vector (RESOURCE_CLASSES=6 classes)."""
    resources = np.zeros(RESOURCE_CLASSES, dtype=np.float32)

    # Mineral mining: dense, rocky planets
    if planet["mean_density_gcc"] > 3.5 and planet["mass_earth"] < 10:
        resources[0] = min(1.0, planet["mean_density_gcc"] / 6.0)

    # Fuel extraction: gas giants with H2
    if planet["atmosphere"].get("H2", 0) > 0.5:
        resources[1] = planet["atmosphere"]["H2"]

    # Atmospheric harvesting: thick atmospheres
    atm_total = sum(planet["atmosphere"].values())
    if atm_total > 0.5:
        resources[2] = min(1.0, atm_total)

    # Water extraction
    h2o = planet["atmosphere"].get("H2O", 0)
    if h2o > 0.0001:
        resources[3] = min(1.0, h2o * 100)
    # Ice moons on gas giants
    if planet["mass_earth"] > 10 and planet["num_moons"] > 5:
        resources[3] = max(resources[3], 0.6)

    # Energy generation: proximity + stellar flux
    flux = 1.0 / max(0.01, planet["semi_major_axis_au"] ** 2)
    resources[4] = min(1.0, flux)

    # Construction materials: rocky with good gravity
    if planet["mean_density_gcc"] > 3.0 and planet["surface_gravity_ms2"] < 15:
        resources[5] = min(1.0, planet["mean_density_gcc"] / 5.0 *
                          (1 - abs(planet["surface_gravity_ms2"] - 9.8) / 20))

    return resources


def compute_timeline(star, planets, suitability_scores):
    """Compute colonization timeline (TIMELINE_PHASES x TIMELINE_FEATURES)."""
    timeline = np.zeros((TIMELINE_PHASES, TIMELINE_FEATURES), dtype=np.float32)

    best_idx = int(np.argmax(suitability_scores))
    best_score = suitability_scores[best_idx]

    # Phase durations scale inversely with best suitability
    base_duration = 5.0 / max(0.1, best_score)

    for phase_idx in range(TIMELINE_PHASES):
        # start_year: cumulative
        if phase_idx == 0:
            timeline[phase_idx, 0] = 0.0
        else:
            timeline[phase_idx, 0] = timeline[phase_idx - 1, 0] + timeline[phase_idx - 1, 1]

        # duration: escalating with phase
        timeline[phase_idx, 1] = base_duration * (1.0 + phase_idx * 0.5)

        # effort_level: normalized 0-1
        timeline[phase_idx, 2] = min(1.0, 0.3 + phase_idx * 0.1)

        # priority: higher for early phases
        timeline[phase_idx, 3] = max(0.0, 1.0 - phase_idx * 0.12)

    # Normalize
    max_year = timeline[-1, 0] + timeline[-1, 1]
    if max_year > 0:
        timeline[:, 0] /= max_year
        timeline[:, 1] /= max_year

    return timeline


def compute_infrastructure(planets, suitability_scores, resource_vectors):
    """Compute infrastructure recommendations (MAX_PLANETS x INFRASTRUCTURE_TYPES)."""
    n = len(planets)
    infra = np.zeros((MAX_PLANETS, INFRASTRUCTURE_TYPES), dtype=np.float32)

    for i in range(n):
        s = suitability_scores[i]
        r = resource_vectors[i]

        # Orbital station — always useful for high-suitability
        infra[i, 0] = s * 0.8

        # Surface habitat — needs decent suitability
        infra[i, 1] = max(0, s - 0.2)

        # Mining facility — needs mineral resources
        infra[i, 2] = r[0] * 0.9

        # Fuel refinery — needs fuel resources
        infra[i, 3] = r[1] * 0.85

        # Atmosphere processor — if there's atmosphere to harvest
        infra[i, 4] = r[2] * 0.7

        # Water extractor — needs water
        infra[i, 5] = r[3] * 0.9

        # Power plant — based on energy potential
        infra[i, 6] = r[4] * 0.8

        # Spaceport — on highest-suitability planets
        infra[i, 7] = s * 0.6

        # Communications relay — moderate for all usable planets
        infra[i, 8] = min(1.0, s + 0.2) * 0.5

        # Terraforming engine — only for planets with some potential
        if 0.2 < s < 0.7 and planets[i]["mass_earth"] < 5:
            infra[i, 9] = s * 0.5

    return infra


def expert_colonization_plan(star, planets):
    """Full rule-based expert system producing ground-truth training labels."""
    from solar_system_data import star_to_feature_vector, planet_to_feature_vector

    # Compute features
    star_vec = star_to_feature_vector(star)

    planet_vecs = []
    for p in planets:
        planet_vecs.append(planet_to_feature_vector(p))

    n_planets = len(planets)

    # Pad planets
    while len(planet_vecs) < MAX_PLANETS:
        planet_vecs.append(np.zeros(PLANET_FEATURE_DIM, dtype=np.float32))

    mask = np.zeros(MAX_PLANETS, dtype=np.float32)
    mask[:n_planets] = 1.0

    # Compute labels
    suitability = np.zeros(MAX_PLANETS, dtype=np.float32)
    resource_vecs = np.zeros((MAX_PLANETS, RESOURCE_CLASSES), dtype=np.float32)

    for i in range(n_planets):
        suitability[i] = compute_suitability(star, planets[i])
        resource_vecs[i] = compute_resources(planets[i])

    timeline = compute_timeline(star, planets, suitability[:n_planets])
    infrastructure = compute_infrastructure(planets, suitability, resource_vecs)

    return {
        "star_features": star_vec,
        "planet_features": np.stack(planet_vecs),
        "planet_mask": mask,
        "suitability": suitability,
        "resources": resource_vecs,
        "timeline": timeline,
        "infrastructure": infrastructure,
    }


# =============================================================================
# PyTorch Dataset
# =============================================================================

class SyntheticColonizationDataset(Dataset):
    """Generates star systems and colonization plans on-the-fly."""

    def __init__(self, size, seed=42):
        self.size = size
        self.seed = seed

    def __len__(self):
        return self.size

    def __getitem__(self, idx):
        rng = np.random.default_rng(self.seed + idx)
        star, planets = generate_star_system(rng)
        plan = expert_colonization_plan(star, planets)

        return {
            "star_features": torch.tensor(plan["star_features"]),
            "planet_features": torch.tensor(plan["planet_features"]),
            "planet_mask": torch.tensor(plan["planet_mask"]),
            "suitability": torch.tensor(plan["suitability"]),
            "resources": torch.tensor(plan["resources"]),
            "timeline": torch.tensor(plan["timeline"]),
            "infrastructure": torch.tensor(plan["infrastructure"]),
        }
