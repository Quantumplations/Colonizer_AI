"""
Colonizer AI — Inference & Plan Generation
Loads a trained model and generates structured colonization plans.
"""

import os
import json
import torch
import numpy as np

from config import (
    DEVICE, MAX_PLANETS, CHECKPOINT_DIR,
    RESOURCE_LABELS, INFRASTRUCTURE_LABELS, PHASE_LABELS,
    SPECTRAL_CLASSES, ATMOSPHERE_GASES,
)
from model import ColonizerModel
from solar_system_data import (
    get_sun_data, get_planet_data, get_solar_system_tensors,
    star_to_feature_vector, planet_to_feature_vector,
)


class PlanAssembler:
    """Converts raw model outputs into a structured colonization plan."""

    def __init__(self, star_data, planet_data_list, model_outputs, planet_mask):
        self.star = star_data
        self.planets = planet_data_list
        self.outputs = model_outputs
        self.mask = planet_mask
        self.n_planets = int(planet_mask[0].sum().item())

    def assemble(self):
        """Build the full colonization plan dict."""
        plan = {
            "star_system": self._format_star_system(),
            "planet_assessments": self._format_planet_assessments(),
            "colonization_timeline": self._format_timeline(),
            "colonization_priority_order": self._get_priority_order(),
            "narrative": self._generate_narrative(),
        }
        return plan

    def _format_star_system(self):
        return {
            "star_name": self.star["name"],
            "spectral_class": self.star["spectral_class"],
            "luminosity_solar": self.star["luminosity_solar"],
            "temperature_K": self.star["effective_temp_K"],
            "mass_solar": self.star["mass_solar"],
            "num_planets": self.n_planets,
        }

    def _format_planet_assessments(self):
        assessments = []
        suit = self.outputs["suitability"][0].cpu().numpy()
        res = self.outputs["resources"][0].cpu().numpy()
        infra = self.outputs["infrastructure"][0].cpu().numpy()

        for i in range(self.n_planets):
            planet = self.planets[i]
            assessment = {
                "name": planet["name"],
                "suitability_score": round(float(suit[i]), 3),
                "suitability_grade": self._score_to_grade(suit[i]),
                "orbital_params": {
                    "semi_major_axis_au": planet["semi_major_axis_au"],
                    "eccentricity": planet["eccentricity"],
                    "orbital_period_yr": planet["orbital_period_yr"],
                },
                "physical_params": {
                    "mass_earth": planet["mass_earth"],
                    "radius_earth": planet["radius_earth"],
                    "surface_temp_K": planet["surface_temp_K"],
                    "surface_gravity_ms2": planet["surface_gravity_ms2"],
                },
                "resources": {
                    RESOURCE_LABELS[j]: round(float(res[i, j]), 3)
                    for j in range(len(RESOURCE_LABELS))
                },
                "recommended_infrastructure": [
                    INFRASTRUCTURE_LABELS[j]
                    for j in range(len(INFRASTRUCTURE_LABELS))
                    if infra[i, j] > 0.3
                ],
                "infrastructure_scores": {
                    INFRASTRUCTURE_LABELS[j]: round(float(infra[i, j]), 3)
                    for j in range(len(INFRASTRUCTURE_LABELS))
                },
            }
            assessments.append(assessment)

        return assessments

    def _format_timeline(self):
        tl = self.outputs["timeline"][0].cpu().numpy()
        phases = []
        total_duration_years = 200  # Scale normalized durations to ~200 years

        for i in range(len(PHASE_LABELS)):
            phase = {
                "phase_number": i + 1,
                "phase_name": PHASE_LABELS[i].replace("_", " ").title(),
                "start_year": round(float(tl[i, 0]) * total_duration_years, 1),
                "duration_years": round(float(tl[i, 1]) * total_duration_years, 1),
                "effort_level": round(float(tl[i, 2]), 3),
                "priority": round(float(tl[i, 3]), 3),
            }
            phases.append(phase)

        return phases

    def _get_priority_order(self):
        suit = self.outputs["suitability"][0].cpu().numpy()
        indices = np.argsort(-suit[:self.n_planets])
        return [self.planets[i]["name"] for i in indices]

    def _score_to_grade(self, score):
        if score >= 0.8:
            return "A — Excellent"
        elif score >= 0.6:
            return "B — Good"
        elif score >= 0.4:
            return "C — Moderate"
        elif score >= 0.2:
            return "D — Poor"
        else:
            return "F — Unsuitable"

    def _generate_narrative(self):
        """Generate a text narrative summarizing the colonization plan."""
        suit = self.outputs["suitability"][0].cpu().numpy()
        priority = self._get_priority_order()

        lines = []
        lines.append(f"=== COLONIZATION ASSESSMENT: {self.star['name']} SYSTEM ===")
        lines.append("")
        lines.append(f"Target star: {self.star['name']} "
                     f"(Spectral class {self.star['spectral_class']}, "
                     f"{self.star['luminosity_solar']:.2f} L☉, "
                     f"{self.star['effective_temp_K']:.0f} K)")
        lines.append(f"Number of planets detected: {self.n_planets}")
        lines.append("")

        # Best candidate
        best_idx = int(np.argmax(suit[:self.n_planets]))
        best = self.planets[best_idx]
        lines.append(f"PRIMARY COLONIZATION TARGET: {best['name']}")
        lines.append(f"  Suitability: {suit[best_idx]:.1%} ({self._score_to_grade(suit[best_idx])})")
        lines.append(f"  Surface temperature: {best['surface_temp_K']:.0f} K")
        lines.append(f"  Surface gravity: {best['surface_gravity_ms2']:.2f} m/s²")
        lines.append(f"  Mass: {best['mass_earth']:.3f} M⊕, Radius: {best['radius_earth']:.3f} R⊕")
        lines.append("")

        lines.append("COLONIZATION PRIORITY ORDER:")
        for rank, name in enumerate(priority, 1):
            idx = next(j for j, p in enumerate(self.planets) if p["name"] == name)
            lines.append(f"  {rank}. {name} — suitability {suit[idx]:.1%}")
        lines.append("")

        # Timeline summary
        tl = self.outputs["timeline"][0].cpu().numpy()
        total_years = 200
        lines.append("COLONIZATION TIMELINE:")
        for i, phase in enumerate(PHASE_LABELS):
            start = tl[i, 0] * total_years
            dur = tl[i, 1] * total_years
            lines.append(f"  Phase {i+1}: {phase.replace('_', ' ').title()}")
            lines.append(f"    Start: Year {start:.0f}, Duration: {dur:.0f} years")
        lines.append("")

        # Resource highlights
        res = self.outputs["resources"][0].cpu().numpy()
        lines.append("KEY RESOURCE FINDINGS:")
        for i in range(self.n_planets):
            top_resources = []
            for j in range(len(RESOURCE_LABELS)):
                if res[i, j] > 0.3:
                    top_resources.append(f"{RESOURCE_LABELS[j].replace('_', ' ')} ({res[i,j]:.0%})")
            if top_resources:
                lines.append(f"  {self.planets[i]['name']}: {', '.join(top_resources)}")

        lines.append("")
        lines.append("=== END OF ASSESSMENT ===")

        return "\n".join(lines)


def run_inference(checkpoint_path=None, use_expert_fallback=True):
    """
    Run inference on the Solar System.

    Args:
        checkpoint_path: Path to model checkpoint. If None, tries default.
        use_expert_fallback: If True and no checkpoint exists, use expert system directly.
    """
    print("=" * 60)
    print("COLONIZER AI — INFERENCE")
    print("=" * 60)

    star_data = get_sun_data()
    planet_data = get_planet_data()
    star_tensor, planet_tensor, mask_tensor, planet_names = get_solar_system_tensors()

    # Try loading model
    if checkpoint_path is None:
        checkpoint_path = os.path.join(CHECKPOINT_DIR, "best.pt")

    model_loaded = False
    if os.path.exists(checkpoint_path):
        print(f"Loading model from {checkpoint_path}...")
        model = ColonizerModel().to(DEVICE)
        ckpt = torch.load(checkpoint_path, map_location=DEVICE, weights_only=False)
        model.load_state_dict(ckpt["model_state_dict"])
        model.eval()
        model_loaded = True
        print("Model loaded successfully!")
    elif use_expert_fallback:
        print("No checkpoint found. Using expert system + untrained model for demonstration...")
        model = ColonizerModel().to(DEVICE)
        model.eval()
        model_loaded = True
    else:
        raise FileNotFoundError(f"No checkpoint found at {checkpoint_path}")

    # Run inference
    print("\nRunning inference on the Solar System...")
    with torch.no_grad():
        star_in = star_tensor.to(DEVICE)
        planet_in = planet_tensor.to(DEVICE)
        mask_in = mask_tensor.to(DEVICE)

        outputs = model(star_in, planet_in, mask_in)

    # Assemble plan
    assembler = PlanAssembler(star_data, planet_data, outputs, mask_tensor)
    plan = assembler.assemble()

    # Print narrative
    print("\n" + plan["narrative"])

    # Save JSON plan
    plan_path = "colonization_plan.json"
    # Convert narrative to string for JSON
    plan_json = {k: v for k, v in plan.items()}
    with open(plan_path, "w") as f:
        json.dump(plan_json, f, indent=2, default=str)
    print(f"\nFull plan saved to {plan_path}")

    return plan


if __name__ == "__main__":
    run_inference()
