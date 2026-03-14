"""
Colonizer AI — Solar System Data
Real astronomical data for our Solar System, formatted as model input.
Used as the primary test case (from the perspective of aliens wishing to colonize).
"""

import numpy as np


def get_sun_data():
    """Return stellar parameters for the Sun."""
    return {
        "name": "Sol",
        "luminosity_solar": 1.0,            # L☉
        "effective_temp_K": 5778,            # K
        "mass_solar": 1.0,                   # M☉
        "radius_solar": 1.0,                 # R☉
        "spectral_class": "G",               # G2V
        "metallicity_fe_h": 0.0,             # [Fe/H]
        "age_gyr": 4.6,                      # Gyr
        "ra_deg": 0.0,                        # RA (reference)
        "dec_deg": 0.0,                       # Dec (reference)
        "distance_pc": 0.0,                   # pc (we're here)
    }


def get_planet_data():
    """Return planetary parameters for all 8 planets of the Solar System."""
    planets = [
        {
            "name": "Mercury",
            "semi_major_axis_au": 0.387,
            "eccentricity": 0.2056,
            "inclination_deg": 7.0,
            "orbital_period_yr": 0.241,
            "mass_earth": 0.055,
            "radius_earth": 0.383,
            "mean_density_gcc": 5.43,
            "surface_temp_K": 440,
            "surface_gravity_ms2": 3.7,
            "has_magnetic_field": True,
            "has_rings": False,
            "num_moons": 0,
            "atmosphere": {  # Trace exosphere
                "H2": 0.0, "He": 0.06, "N2": 0.0, "O2": 0.42,
                "CO2": 0.0, "H2O": 0.0, "CH4": 0.0, "Ar": 0.0,
            },
        },
        {
            "name": "Venus",
            "semi_major_axis_au": 0.723,
            "eccentricity": 0.0068,
            "inclination_deg": 3.39,
            "orbital_period_yr": 0.615,
            "mass_earth": 0.815,
            "radius_earth": 0.949,
            "mean_density_gcc": 5.24,
            "surface_temp_K": 737,
            "surface_gravity_ms2": 8.87,
            "has_magnetic_field": False,
            "has_rings": False,
            "num_moons": 0,
            "atmosphere": {
                "H2": 0.0, "He": 0.0, "N2": 0.035, "O2": 0.0,
                "CO2": 0.965, "H2O": 0.002, "CH4": 0.0, "Ar": 0.007,
            },
        },
        {
            "name": "Earth",
            "semi_major_axis_au": 1.0,
            "eccentricity": 0.0167,
            "inclination_deg": 0.0,
            "orbital_period_yr": 1.0,
            "mass_earth": 1.0,
            "radius_earth": 1.0,
            "mean_density_gcc": 5.51,
            "surface_temp_K": 288,
            "surface_gravity_ms2": 9.81,
            "has_magnetic_field": True,
            "has_rings": False,
            "num_moons": 1,
            "atmosphere": {
                "H2": 0.0, "He": 0.0, "N2": 0.78, "O2": 0.21,
                "CO2": 0.0004, "H2O": 0.01, "CH4": 0.00017, "Ar": 0.0093,
            },
        },
        {
            "name": "Mars",
            "semi_major_axis_au": 1.524,
            "eccentricity": 0.0934,
            "inclination_deg": 1.85,
            "orbital_period_yr": 1.881,
            "mass_earth": 0.107,
            "radius_earth": 0.532,
            "mean_density_gcc": 3.93,
            "surface_temp_K": 210,
            "surface_gravity_ms2": 3.72,
            "has_magnetic_field": False,
            "has_rings": False,
            "num_moons": 2,
            "atmosphere": {
                "H2": 0.0, "He": 0.0, "N2": 0.027, "O2": 0.001,
                "CO2": 0.953, "H2O": 0.0003, "CH4": 0.0, "Ar": 0.016,
            },
        },
        {
            "name": "Jupiter",
            "semi_major_axis_au": 5.203,
            "eccentricity": 0.0489,
            "inclination_deg": 1.31,
            "orbital_period_yr": 11.86,
            "mass_earth": 317.8,
            "radius_earth": 11.21,
            "mean_density_gcc": 1.33,
            "surface_temp_K": 165,
            "surface_gravity_ms2": 24.79,
            "has_magnetic_field": True,
            "has_rings": True,
            "num_moons": 95,
            "atmosphere": {
                "H2": 0.898, "He": 0.102, "N2": 0.0, "O2": 0.0,
                "CO2": 0.0, "H2O": 0.0004, "CH4": 0.003, "Ar": 0.0,
            },
        },
        {
            "name": "Saturn",
            "semi_major_axis_au": 9.537,
            "eccentricity": 0.0565,
            "inclination_deg": 2.49,
            "orbital_period_yr": 29.46,
            "mass_earth": 95.16,
            "radius_earth": 9.45,
            "mean_density_gcc": 0.687,
            "surface_temp_K": 134,
            "surface_gravity_ms2": 10.44,
            "has_magnetic_field": True,
            "has_rings": True,
            "num_moons": 146,
            "atmosphere": {
                "H2": 0.963, "He": 0.0325, "N2": 0.0, "O2": 0.0,
                "CO2": 0.0, "H2O": 0.0001, "CH4": 0.0045, "Ar": 0.0,
            },
        },
        {
            "name": "Uranus",
            "semi_major_axis_au": 19.19,
            "eccentricity": 0.0457,
            "inclination_deg": 0.77,
            "orbital_period_yr": 84.01,
            "mass_earth": 14.54,
            "radius_earth": 4.01,
            "mean_density_gcc": 1.27,
            "surface_temp_K": 76,
            "surface_gravity_ms2": 8.87,
            "has_magnetic_field": True,
            "has_rings": True,
            "num_moons": 28,
            "atmosphere": {
                "H2": 0.83, "He": 0.15, "N2": 0.0, "O2": 0.0,
                "CO2": 0.0, "H2O": 0.0, "CH4": 0.023, "Ar": 0.0,
            },
        },
        {
            "name": "Neptune",
            "semi_major_axis_au": 30.07,
            "eccentricity": 0.0113,
            "inclination_deg": 1.77,
            "orbital_period_yr": 164.8,
            "mass_earth": 17.15,
            "radius_earth": 3.88,
            "mean_density_gcc": 1.64,
            "surface_temp_K": 72,
            "surface_gravity_ms2": 11.15,
            "has_magnetic_field": True,
            "has_rings": True,
            "num_moons": 16,
            "atmosphere": {
                "H2": 0.80, "He": 0.19, "N2": 0.0, "O2": 0.0,
                "CO2": 0.0, "H2O": 0.0, "CH4": 0.015, "Ar": 0.0,
            },
        },
    ]
    return planets


def star_to_feature_vector(star_data):
    """Convert star dict to a numpy feature vector matching config.STAR_FEATURE_DIM."""
    from config import SPECTRAL_CLASSES

    spectral_onehot = [0.0] * len(SPECTRAL_CLASSES)
    if star_data["spectral_class"] in SPECTRAL_CLASSES:
        idx = SPECTRAL_CLASSES.index(star_data["spectral_class"])
        spectral_onehot[idx] = 1.0

    features = [
        star_data["luminosity_solar"],
        star_data["effective_temp_K"] / 10000.0,       # normalize
        star_data["mass_solar"],
        star_data["radius_solar"],
        star_data["metallicity_fe_h"],
        star_data["age_gyr"] / 10.0,                   # normalize
        star_data["ra_deg"] / 360.0,                    # normalize
        star_data["dec_deg"] / 90.0,                    # normalize
        star_data["distance_pc"] / 1000.0,              # normalize
    ] + spectral_onehot

    return np.array(features, dtype=np.float32)


def planet_to_feature_vector(planet_data):
    """Convert planet dict to a numpy feature vector matching config.PLANET_FEATURE_DIM."""
    from config import ATMOSPHERE_GASES

    atm = [planet_data["atmosphere"].get(g, 0.0) for g in ATMOSPHERE_GASES]

    features = [
        np.log1p(planet_data["semi_major_axis_au"]),          # log scale
        planet_data["eccentricity"],
        planet_data["inclination_deg"] / 90.0,                # normalize
        np.log1p(planet_data["orbital_period_yr"]),            # log scale
        np.log1p(planet_data["mass_earth"]),                   # log scale
        np.log1p(planet_data["radius_earth"]),                 # log scale
        planet_data["mean_density_gcc"] / 6.0,                # normalize
        planet_data["surface_temp_K"] / 1000.0,               # normalize
        planet_data["surface_gravity_ms2"] / 25.0,            # normalize
        float(planet_data["has_magnetic_field"]),
        float(planet_data["has_rings"]),
        min(planet_data["num_moons"], 200) / 200.0,           # normalize
    ] + atm

    return np.array(features, dtype=np.float32)


def get_solar_system_tensors():
    """Return ready-to-use torch tensors for the Solar System."""
    import torch
    from config import MAX_PLANETS, PLANET_FEATURE_DIM

    star = get_sun_data()
    planets = get_planet_data()

    star_vec = star_to_feature_vector(star)

    planet_vecs = []
    for p in planets:
        planet_vecs.append(planet_to_feature_vector(p))

    # Pad to MAX_PLANETS
    n_planets = len(planet_vecs)
    while len(planet_vecs) < MAX_PLANETS:
        planet_vecs.append(np.zeros(PLANET_FEATURE_DIM, dtype=np.float32))

    # Create mask (1 = real planet, 0 = padding)
    mask = np.zeros(MAX_PLANETS, dtype=np.float32)
    mask[:n_planets] = 1.0

    star_tensor = torch.tensor(star_vec).unsqueeze(0)               # (1, STAR_DIM)
    planet_tensor = torch.tensor(np.stack(planet_vecs)).unsqueeze(0) # (1, MAX_P, PLANET_DIM)
    mask_tensor = torch.tensor(mask).unsqueeze(0)                    # (1, MAX_P)

    return star_tensor, planet_tensor, mask_tensor, [p["name"] for p in planets]
