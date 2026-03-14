"""
Colonizer AI — NASA Exoplanet Archive Dataset

Downloads confirmed exoplanet data from the NASA Exoplanet Archive TAP API
and converts it into the same format as SyntheticColonizationDataset.

Missing features are filled using astrophysical priors from data_generator.py.
Labels (suitability, resources, timeline, infrastructure) are still generated
by the rule-based expert system, since no real colonization data exists.
"""

import csv
import io
import os
import urllib.request

import numpy as np
import torch
from torch.utils.data import Dataset

from config import MAX_PLANETS, SPECTRAL_CLASSES
from data_generator import (
    expert_colonization_plan,
    SPECTRAL_MASS_RANGES,
    SPECTRAL_TEMP_RANGES,
    SPECTRAL_PROBS,
)

# ---------------------------------------------------------------------------
# NASA Exoplanet Archive TAP query
# Fetches one row per planet with host star params included (pscomppars view).
# ---------------------------------------------------------------------------
_NASA_TAP_URL = (
    "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
    "?query=SELECT+hostname,pl_name,st_teff,st_mass,st_rad,st_lum,"
    "st_met,st_age,st_spectype,ra,dec,sy_dist,"
    "pl_orbsmax,pl_orbeccen,pl_orbincl,pl_orbper,"
    "pl_bmasse,pl_rade,pl_dens,pl_eqt"
    "+FROM+pscomppars"
    "+WHERE+pl_controv_flag=0"
    "&format=csv"
)

_CACHE_FILE = os.path.join(os.path.dirname(__file__), "nasa_exoplanet_cache.csv")


# ---------------------------------------------------------------------------
# Download & cache
# ---------------------------------------------------------------------------

def download_nasa_data(cache_path=_CACHE_FILE, force=False):
    """Download NASA Exoplanet Archive data, caching the CSV to disk."""
    if os.path.exists(cache_path) and not force:
        print(f"Using cached NASA data: {cache_path}")
        with open(cache_path, "r", encoding="utf-8") as f:
            return f.read()

    print("Downloading NASA Exoplanet Archive data (this may take ~30 s)...")
    with urllib.request.urlopen(_NASA_TAP_URL, timeout=120) as resp:
        data = resp.read().decode("utf-8")

    with open(cache_path, "w", encoding="utf-8") as f:
        f.write(data)
    print(f"Saved to {cache_path}")
    return data


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def _float(val, default=None):
    """Parse a CSV field as float, returning default on missing/invalid."""
    try:
        return float(val) if val and val.strip() else default
    except (ValueError, AttributeError):
        return default


def _spectral_class(spectype):
    """Extract single-letter spectral class from a full type string (e.g. 'G2V' -> 'G')."""
    if not spectype:
        return None
    s = spectype.strip().upper()
    for cls in SPECTRAL_CLASSES:
        if s.startswith(cls):
            return cls
    return None


# ---------------------------------------------------------------------------
# Feature builders  (real value where available, prior-sampled otherwise)
# ---------------------------------------------------------------------------

def _build_star(row, rng):
    spec_class = _spectral_class(row.get("st_spectype", ""))
    if spec_class is None:
        spec_class = rng.choice(SPECTRAL_CLASSES, p=SPECTRAL_PROBS)

    mass_lo, mass_hi = SPECTRAL_MASS_RANGES[spec_class]
    temp_lo, temp_hi = SPECTRAL_TEMP_RANGES[spec_class]

    mass = _float(row.get("st_mass"))
    if mass is None or mass <= 0:
        mass = float(rng.uniform(mass_lo, mass_hi))

    temp = _float(row.get("st_teff"))
    if temp is None or temp <= 0:
        temp = float(rng.uniform(temp_lo, temp_hi))

    # NASA archive stores st_lum as log10(L/L_sun)
    lum_log = _float(row.get("st_lum"))
    luminosity = (10.0 ** lum_log) if lum_log is not None else (mass ** 3.5)

    radius = _float(row.get("st_rad"))
    if radius is None or radius <= 0:
        radius = mass ** 0.8

    metallicity = _float(row.get("st_met"), default=float(rng.normal(0.0, 0.3)))
    age = _float(row.get("st_age"))
    if age is None or age <= 0:
        age = float(rng.uniform(0.1, 12.0))

    ra = _float(row.get("ra"), default=float(rng.uniform(0, 360)))
    dec = _float(row.get("dec"), default=float(rng.uniform(-90, 90)))
    dist = _float(row.get("sy_dist"), default=float(rng.exponential(100)))

    return {
        "name": row.get("hostname", "Unknown").strip(),
        "luminosity_solar": float(luminosity),
        "effective_temp_K": float(temp),
        "mass_solar": float(mass),
        "radius_solar": float(radius),
        "spectral_class": spec_class,
        "metallicity_fe_h": float(metallicity),
        "age_gyr": float(age),
        "ra_deg": float(ra),
        "dec_deg": float(dec),
        "distance_pc": float(dist),
    }


def _build_planet(row, star, index, rng):
    sma = _float(row.get("pl_orbsmax"))
    if sma is None or sma <= 0:
        sma = float(np.clip(
            rng.lognormal(np.log(0.3 + index * 0.8), 0.5) * (star["mass_solar"] ** 0.5),
            0.05, 100.0,
        ))

    ecc = _float(row.get("pl_orbeccen"))
    if ecc is None or not (0.0 <= ecc < 1.0):
        ecc = float(rng.beta(1.5, 10))

    inc = _float(row.get("pl_orbincl"))
    if inc is None:
        inc = float(abs(rng.normal(0, 5)))

    period = _float(row.get("pl_orbper"))
    if period is not None and period > 0:
        period = period / 365.25          # days -> years
    else:
        period = sma ** 1.5 / max(star["mass_solar"] ** 0.5, 1e-6)

    mass = _float(row.get("pl_bmasse"))   # already in Earth masses
    radius = _float(row.get("pl_rade"))   # already in Earth radii
    density = _float(row.get("pl_dens"))  # g/cc

    is_rocky = sma < 2.0

    if mass is None or mass <= 0:
        if is_rocky:
            mass = float(np.clip(rng.lognormal(np.log(0.5), 0.8), 0.01, 10.0))
        else:
            mass = float(np.clip(rng.lognormal(np.log(50.0), 1.2), 5.0, 5000.0))

    if radius is None or radius <= 0:
        radius = float(mass ** 0.27) if is_rocky else float(3.0 + rng.uniform(0, 10.0) * (mass / 300.0) ** 0.1)

    if density is None or density <= 0:
        # rho [g/cc] = mass_earth * 5.51 / radius_earth^3  (Earth reference)
        density = float(np.clip(mass * 5.51 / max(radius ** 3, 1e-6), 0.1, 15.0))

    surface_temp = _float(row.get("pl_eqt"))
    if surface_temp is None or surface_temp <= 0:
        flux = star["luminosity_solar"] / max(sma ** 2, 1e-6)
        surface_temp = float(278 * (flux ** 0.25) * rng.uniform(0.8, 1.5))

    surface_gravity = float(mass / max(radius ** 2, 1e-6) * 9.81)

    # Fields not in NASA catalog — estimated from physics
    has_mag = bool(mass > 0.5 and density > 3.0 and rng.random() < 0.5)
    has_rings = bool(mass > 50 and rng.random() < 0.4)
    num_moons = int(rng.poisson(max(0.0, mass ** 0.3 * 0.5)))

    if is_rocky:
        co2 = float(rng.uniform(0, 0.97))
        n2 = float(rng.uniform(0, 1.0 - co2))
        o2 = float(rng.uniform(0, 1.0 - co2 - n2))
        remaining = max(0.0, 1.0 - co2 - n2 - o2)
        h2o = float(rng.uniform(0, remaining))
        ar = max(0.0, remaining - h2o)
        atm = {"H2": 0.0, "He": 0.0, "N2": n2, "O2": o2,
               "CO2": co2, "H2O": h2o, "CH4": 0.0, "Ar": ar}
    else:
        h2 = float(rng.uniform(0.7, 0.96))
        he = float(rng.uniform(0.02, 1.0 - h2))
        ch4 = float(rng.uniform(0, 0.03))
        remaining = max(0.0, 1.0 - h2 - he - ch4)
        atm = {"H2": h2, "He": he, "N2": 0.0, "O2": 0.0,
               "CO2": 0.0, "H2O": remaining * 0.5, "CH4": ch4, "Ar": 0.0}

    return {
        "name": row.get("pl_name", f"Planet-{index + 1}").strip(),
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
        "num_moons": num_moons,
        "atmosphere": atm,
    }


# ---------------------------------------------------------------------------
# Main loader
# ---------------------------------------------------------------------------

def load_nasa_star_systems(cache_path=_CACHE_FILE, force_download=False, seed=42):
    """
    Parse the NASA Exoplanet Archive CSV into a list of (star_dict, [planet_dict])
    tuples, one per host star.
    """
    rng = np.random.default_rng(seed)
    raw = download_nasa_data(cache_path, force=force_download)

    reader = csv.DictReader(io.StringIO(raw))

    # Group planet rows by host star name
    systems = {}
    for row in reader:
        host = row.get("hostname", "").strip()
        if not host:
            continue
        systems.setdefault(host, []).append(row)

    result = []
    for host, planet_rows in systems.items():
        star = _build_star(planet_rows[0], rng)

        # Sort planets by semi-major axis so index order is meaningful
        planet_rows.sort(key=lambda r: (_float(r.get("pl_orbsmax")) or 999.0))
        planet_rows = planet_rows[:MAX_PLANETS]

        planets = [_build_planet(r, star, i, rng) for i, r in enumerate(planet_rows)]
        result.append((star, planets))

    n_planets = sum(len(p) for _, p in result)
    print(f"Loaded {len(result)} star systems ({n_planets} planets) from NASA Exoplanet Archive")
    return result


# ---------------------------------------------------------------------------
# PyTorch Dataset
# ---------------------------------------------------------------------------

class NASAExoplanetDataset(Dataset):
    """
    PyTorch Dataset backed by real NASA Exoplanet Archive data.

    Orbital and stellar features come from real measurements (missing values
    are filled with astrophysical priors). Colonization labels (suitability,
    resources, timeline, infrastructure) are generated by the same rule-based
    expert system used for synthetic data, since no real colonization labels
    exist.
    """

    def __init__(self, systems):
        """
        Args:
            systems: list of (star_dict, [planet_dict]) tuples, as returned
                     by load_nasa_star_systems().
        """
        self.systems = systems

    def __len__(self):
        return len(self.systems)

    def __getitem__(self, idx):
        star, planets = self.systems[idx]
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
