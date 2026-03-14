"""
Colonizer AI — Neural Network Model
Flexible Transformer-based architecture for star system colonization planning.

Architecture:
    StarEncoder (MLP) → star embedding
    PlanetEncoder (shared MLP) → per-planet embeddings
    CrossAttentionBackbone → system-level representations
    4 Decoder Heads → suitability, resources, timeline, infrastructure
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F

from config import (
    STAR_FEATURE_DIM, PLANET_FEATURE_DIM, MAX_PLANETS,
    STAR_EMBED_DIM, PLANET_EMBED_DIM, HIDDEN_DIM,
    NUM_ATTENTION_HEADS, NUM_TRANSFORMER_LAYERS, DROPOUT,
    FEEDFORWARD_DIM, SUITABILITY_DIM, RESOURCE_CLASSES,
    TIMELINE_PHASES, TIMELINE_FEATURES, INFRASTRUCTURE_TYPES,
)


# =============================================================================
# Building Blocks
# =============================================================================

class MLPBlock(nn.Module):
    """Multi-layer perceptron with residual connection and layer norm."""

    def __init__(self, in_dim, hidden_dim, out_dim, dropout=DROPOUT, num_layers=2):
        super().__init__()
        layers = []
        prev_dim = in_dim
        for i in range(num_layers - 1):
            layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.GELU(),
                nn.LayerNorm(hidden_dim),
                nn.Dropout(dropout),
            ])
            prev_dim = hidden_dim
        layers.append(nn.Linear(prev_dim, out_dim))
        self.net = nn.Sequential(*layers)

        # Residual projection if dims differ
        self.residual = nn.Linear(in_dim, out_dim) if in_dim != out_dim else nn.Identity()
        self.norm = nn.LayerNorm(out_dim)

    def forward(self, x):
        return self.norm(self.net(x) + self.residual(x))


class PositionalEncoding(nn.Module):
    """Learnable positional encoding for planet slots."""

    def __init__(self, max_len, d_model):
        super().__init__()
        self.pe = nn.Parameter(torch.randn(1, max_len, d_model) * 0.02)

    def forward(self, x):
        return x + self.pe[:, :x.size(1), :]


# =============================================================================
# Encoders
# =============================================================================

class StarEncoder(nn.Module):
    """Encodes stellar parameters into a star embedding."""

    def __init__(self, in_dim=STAR_FEATURE_DIM, embed_dim=STAR_EMBED_DIM):
        super().__init__()
        self.encoder = MLPBlock(in_dim, embed_dim * 2, embed_dim, num_layers=3)

    def forward(self, star_features):
        """
        Args:
            star_features: (B, STAR_FEATURE_DIM)
        Returns:
            star_embed: (B, 1, STAR_EMBED_DIM)
        """
        return self.encoder(star_features).unsqueeze(1)


class PlanetEncoder(nn.Module):
    """Shared MLP encoding per-planet features into embeddings."""

    def __init__(self, in_dim=PLANET_FEATURE_DIM, embed_dim=PLANET_EMBED_DIM):
        super().__init__()
        self.encoder = MLPBlock(in_dim, embed_dim * 2, embed_dim, num_layers=3)
        self.pos_enc = PositionalEncoding(MAX_PLANETS, embed_dim)

    def forward(self, planet_features, mask=None):
        """
        Args:
            planet_features: (B, MAX_PLANETS, PLANET_FEATURE_DIM)
            mask: (B, MAX_PLANETS) — 1 for real planets, 0 for padding
        Returns:
            planet_embeds: (B, MAX_PLANETS, PLANET_EMBED_DIM)
        """
        embeds = self.encoder(planet_features)  # (B, MAX_P, embed_dim)
        embeds = self.pos_enc(embeds)

        # Zero out padded planets
        if mask is not None:
            embeds = embeds * mask.unsqueeze(-1)

        return embeds


# =============================================================================
# Cross-Attention Backbone
# =============================================================================

class CrossAttentionLayer(nn.Module):
    """
    One layer of the backbone:
    1. Planets attend to star (cross-attention)
    2. Planets attend to each other (self-attention)
    3. Feedforward transformation
    """

    def __init__(self, d_model=HIDDEN_DIM, n_heads=NUM_ATTENTION_HEADS,
                 ff_dim=FEEDFORWARD_DIM, dropout=DROPOUT):
        super().__init__()

        # Cross-attention: planets (Q) attend to star (KV)
        self.cross_attn = nn.MultiheadAttention(
            embed_dim=d_model, num_heads=n_heads,
            dropout=dropout, batch_first=True
        )
        self.cross_norm = nn.LayerNorm(d_model)

        # Self-attention: planets attend to each other
        self.self_attn = nn.MultiheadAttention(
            embed_dim=d_model, num_heads=n_heads,
            dropout=dropout, batch_first=True
        )
        self.self_norm = nn.LayerNorm(d_model)

        # Feedforward
        self.ff = nn.Sequential(
            nn.Linear(d_model, ff_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(ff_dim, d_model),
            nn.Dropout(dropout),
        )
        self.ff_norm = nn.LayerNorm(d_model)

    def forward(self, planet_embeds, star_embed, key_padding_mask=None):
        """
        Args:
            planet_embeds: (B, MAX_P, D)
            star_embed: (B, 1, D)
            key_padding_mask: (B, MAX_P) — True for padding positions
        Returns:
            updated planet_embeds: (B, MAX_P, D)
        """
        # Cross-attention to star
        x = planet_embeds
        cross_out, _ = self.cross_attn(
            query=x, key=star_embed, value=star_embed
        )
        x = self.cross_norm(x + cross_out)

        # Self-attention among planets
        self_out, _ = self.self_attn(
            query=x, key=x, value=x,
            key_padding_mask=key_padding_mask
        )
        x = self.self_norm(x + self_out)

        # Feedforward
        x = self.ff_norm(x + self.ff(x))

        return x


class CrossAttentionBackbone(nn.Module):
    """Stack of cross-attention layers forming the transformer backbone."""

    def __init__(self, n_layers=NUM_TRANSFORMER_LAYERS, d_model=HIDDEN_DIM,
                 n_heads=NUM_ATTENTION_HEADS, ff_dim=FEEDFORWARD_DIM):
        super().__init__()

        # Project star and planet embeddings to the same hidden dim
        self.star_proj = nn.Linear(STAR_EMBED_DIM, d_model)
        self.planet_proj = nn.Linear(PLANET_EMBED_DIM, d_model)

        self.layers = nn.ModuleList([
            CrossAttentionLayer(d_model, n_heads, ff_dim)
            for _ in range(n_layers)
        ])

        # Global system embedding via attention pooling
        self.system_query = nn.Parameter(torch.randn(1, 1, d_model) * 0.02)
        self.system_attn = nn.MultiheadAttention(
            embed_dim=d_model, num_heads=n_heads, batch_first=True
        )
        self.system_norm = nn.LayerNorm(d_model)

    def forward(self, star_embed, planet_embeds, mask):
        """
        Args:
            star_embed: (B, 1, STAR_EMBED_DIM)
            planet_embeds: (B, MAX_P, PLANET_EMBED_DIM)
            mask: (B, MAX_P) — 1=real, 0=pad
        Returns:
            planet_repr: (B, MAX_P, HIDDEN_DIM) — per-planet representations
            system_repr: (B, HIDDEN_DIM) — global system representation
        """
        star_h = self.star_proj(star_embed)      # (B, 1, D)
        planet_h = self.planet_proj(planet_embeds)  # (B, MAX_P, D)

        # Padding mask for attention (True = ignore)
        key_padding_mask = (mask == 0)  # (B, MAX_P)

        for layer in self.layers:
            planet_h = layer(planet_h, star_h, key_padding_mask)

        # Mask padded positions
        planet_h = planet_h * mask.unsqueeze(-1)

        # Global system representation via attention pooling
        B = planet_h.size(0)
        sys_query = self.system_query.expand(B, -1, -1)
        all_tokens = torch.cat([star_h, planet_h], dim=1)  # (B, 1+MAX_P, D)

        # Build extended mask
        star_mask = torch.zeros(B, 1, dtype=torch.bool, device=mask.device)
        ext_mask = torch.cat([star_mask, key_padding_mask], dim=1)

        sys_out, _ = self.system_attn(
            query=sys_query, key=all_tokens, value=all_tokens,
            key_padding_mask=ext_mask
        )
        system_repr = self.system_norm(sys_out.squeeze(1))  # (B, D)

        return planet_h, system_repr


# =============================================================================
# Decoder Heads
# =============================================================================

class SuitabilityHead(nn.Module):
    """Per-planet colonization suitability score (0-1)."""

    def __init__(self, d_model=HIDDEN_DIM):
        super().__init__()
        self.head = nn.Sequential(
            nn.Linear(d_model, d_model // 2),
            nn.GELU(),
            nn.Linear(d_model // 2, SUITABILITY_DIM),
            nn.Sigmoid(),
        )

    def forward(self, planet_repr, mask):
        """Returns: (B, MAX_PLANETS)"""
        scores = self.head(planet_repr).squeeze(-1)  # (B, MAX_P)
        return scores * mask


class ResourceHead(nn.Module):
    """Per-planet resource classification (multi-label, 0-1 per resource)."""

    def __init__(self, d_model=HIDDEN_DIM):
        super().__init__()
        self.head = nn.Sequential(
            nn.Linear(d_model, d_model // 2),
            nn.GELU(),
            nn.Linear(d_model // 2, RESOURCE_CLASSES),
            nn.Sigmoid(),
        )

    def forward(self, planet_repr, mask):
        """Returns: (B, MAX_PLANETS, RESOURCE_CLASSES)"""
        out = self.head(planet_repr)  # (B, MAX_P, RC)
        return out * mask.unsqueeze(-1)


class TimelineHead(nn.Module):
    """Colonization timeline: sequence of phases with timing info."""

    def __init__(self, d_model=HIDDEN_DIM):
        super().__init__()
        self.head = nn.Sequential(
            nn.Linear(d_model, d_model),
            nn.GELU(),
            nn.Linear(d_model, TIMELINE_PHASES * TIMELINE_FEATURES),
        )

    def forward(self, system_repr):
        """
        Args:
            system_repr: (B, HIDDEN_DIM) — global system representation
        Returns:
            (B, TIMELINE_PHASES, TIMELINE_FEATURES)
        """
        out = self.head(system_repr)  # (B, PHASES * FEATURES)
        out = out.view(-1, TIMELINE_PHASES, TIMELINE_FEATURES)
        # Sigmoid on start/duration (cols 0,1), clamp effort/priority
        out = torch.cat([
            torch.sigmoid(out[:, :, :2]),   # start_year, duration (0-1)
            torch.sigmoid(out[:, :, 2:]),   # effort, priority (0-1)
        ], dim=-1)
        return out


class InfrastructureHead(nn.Module):
    """Per-planet infrastructure recommendations (0-1 per type)."""

    def __init__(self, d_model=HIDDEN_DIM):
        super().__init__()
        self.head = nn.Sequential(
            nn.Linear(d_model, d_model),
            nn.GELU(),
            nn.Dropout(DROPOUT),
            nn.Linear(d_model, INFRASTRUCTURE_TYPES),
            nn.Sigmoid(),
        )

    def forward(self, planet_repr, mask):
        """Returns: (B, MAX_PLANETS, INFRASTRUCTURE_TYPES)"""
        out = self.head(planet_repr)
        return out * mask.unsqueeze(-1)


# =============================================================================
# Top-Level Model
# =============================================================================

class ColonizerModel(nn.Module):
    """
    Full Colonizer AI model.

    Input:  star features + planet features + planet mask
    Output: suitability scores, resource vectors, timeline, infrastructure
    """

    def __init__(self):
        super().__init__()

        self.star_encoder = StarEncoder()
        self.planet_encoder = PlanetEncoder()
        self.backbone = CrossAttentionBackbone()

        self.suitability_head = SuitabilityHead()
        self.resource_head = ResourceHead()
        self.timeline_head = TimelineHead()
        self.infrastructure_head = InfrastructureHead()

        # Initialize weights
        self.apply(self._init_weights)

        # Count parameters
        total = sum(p.numel() for p in self.parameters())
        trainable = sum(p.numel() for p in self.parameters() if p.requires_grad)
        print(f"ColonizerModel initialized: {total:,} total params, {trainable:,} trainable")

    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            nn.init.xavier_uniform_(module.weight)
            if module.bias is not None:
                nn.init.zeros_(module.bias)
        elif isinstance(module, nn.LayerNorm):
            nn.init.ones_(module.weight)
            nn.init.zeros_(module.bias)

    def forward(self, star_features, planet_features, planet_mask):
        """
        Args:
            star_features:   (B, STAR_FEATURE_DIM)
            planet_features: (B, MAX_PLANETS, PLANET_FEATURE_DIM)
            planet_mask:     (B, MAX_PLANETS) — 1=real, 0=pad

        Returns dict with:
            suitability:     (B, MAX_PLANETS)
            resources:       (B, MAX_PLANETS, RESOURCE_CLASSES)
            timeline:        (B, TIMELINE_PHASES, TIMELINE_FEATURES)
            infrastructure:  (B, MAX_PLANETS, INFRASTRUCTURE_TYPES)
        """
        # Encode
        star_embed = self.star_encoder(star_features)         # (B,1,D_star)
        planet_embeds = self.planet_encoder(planet_features, planet_mask)  # (B,MAX_P,D_planet)

        # Backbone
        planet_repr, system_repr = self.backbone(star_embed, planet_embeds, planet_mask)

        # Decode
        suitability = self.suitability_head(planet_repr, planet_mask)
        resources = self.resource_head(planet_repr, planet_mask)
        timeline = self.timeline_head(system_repr)
        infrastructure = self.infrastructure_head(planet_repr, planet_mask)

        return {
            "suitability": suitability,
            "resources": resources,
            "timeline": timeline,
            "infrastructure": infrastructure,
        }


def count_parameters(model):
    """Utility to print parameter count by module."""
    print("\n=== Parameter Count by Module ===")
    for name, module in model.named_children():
        params = sum(p.numel() for p in module.parameters())
        print(f"  {name:30s} {params:>10,}")
    total = sum(p.numel() for p in model.parameters())
    print(f"  {'TOTAL':30s} {total:>10,}")
    return total
