"""
Colonizer AI — Configuration & Hyperparameters
All model, training, and data generation settings in one place.
"""

# =============================================================================
# Feature Dimensions
# =============================================================================

# Stellar features: luminosity, temperature, mass, radius, metallicity, age,
#                   RA, Dec, distance, + 7 spectral class one-hot (OBAFGKM)
STAR_FEATURE_DIM = 16

# Planetary features: semi-major axis, eccentricity, inclination, period,
#                     mass, radius, density, surface_temp, surface_gravity,
#                     has_magnetic_field, has_rings, num_moons,
#                     + 8 atmospheric composition (H2, He, N2, O2, CO2, H2O, CH4, Ar)
PLANET_FEATURE_DIM = 20

# Maximum number of planets per system (padded/masked)
MAX_PLANETS = 12

# =============================================================================
# Model Architecture
# =============================================================================

# Embedding dimensions
STAR_EMBED_DIM = 128
PLANET_EMBED_DIM = 128
HIDDEN_DIM = 256

# Transformer backbone
NUM_ATTENTION_HEADS = 8
NUM_TRANSFORMER_LAYERS = 4
DROPOUT = 0.1
FEEDFORWARD_DIM = 512

# Decoder heads output dimensions
SUITABILITY_DIM = 1          # per-planet scalar score
RESOURCE_CLASSES = 6         # mining, fuel, atmosphere, water, energy, construction
TIMELINE_PHASES = 8          # max colonization phases
TIMELINE_FEATURES = 4        # per phase: start_year, duration, effort_level, priority
INFRASTRUCTURE_TYPES = 10    # types of infrastructure per phase

# =============================================================================
# Training Hyperparameters
# =============================================================================

LEARNING_RATE = 1e-4
WEIGHT_DECAY = 1e-5
BATCH_SIZE = 32
NUM_EPOCHS = 100
GRAD_CLIP_NORM = 1.0
WARMUP_STEPS = 500
CHECKPOINT_DIR = "checkpoints"
LOG_INTERVAL = 50

# Loss weights for multi-task training
LOSS_WEIGHT_SUITABILITY = 1.0
LOSS_WEIGHT_RESOURCE = 0.8
LOSS_WEIGHT_TIMELINE = 0.6
LOSS_WEIGHT_INFRASTRUCTURE = 0.5

# =============================================================================
# Data Generation
# =============================================================================

TRAIN_DATASET_SIZE = 10000
VAL_DATASET_SIZE = 1000
NUM_WORKERS = 0  # Windows compatibility

# =============================================================================
# Atmospheric composition indices (order in feature vector)
# =============================================================================

ATMOSPHERE_GASES = ["H2", "He", "N2", "O2", "CO2", "H2O", "CH4", "Ar"]

# =============================================================================
# Spectral class encoding
# =============================================================================

SPECTRAL_CLASSES = ["O", "B", "A", "F", "G", "K", "M"]

# =============================================================================
# Resource type labels
# =============================================================================

RESOURCE_LABELS = [
    "mineral_mining",
    "fuel_extraction",
    "atmospheric_harvesting",
    "water_extraction",
    "energy_generation",
    "construction_materials",
]

# =============================================================================
# Infrastructure type labels
# =============================================================================

INFRASTRUCTURE_LABELS = [
    "orbital_station",
    "surface_habitat",
    "mining_facility",
    "fuel_refinery",
    "atmosphere_processor",
    "water_extractor",
    "power_plant",
    "spaceport",
    "communications_relay",
    "terraforming_engine",
]

# =============================================================================
# Colonization phase labels
# =============================================================================

PHASE_LABELS = [
    "reconnaissance",
    "orbital_insertion",
    "initial_landing",
    "base_establishment",
    "resource_extraction",
    "expansion",
    "terraforming",
    "full_colonization",
]

# =============================================================================
# Device
# =============================================================================

import torch
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
