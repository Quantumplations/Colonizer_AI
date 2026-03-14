"""
Colonizer AI — Training Pipeline
Multi-task training with synthetic star system data.
"""

import os
import time
import argparse
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from config import (
    LEARNING_RATE, WEIGHT_DECAY, BATCH_SIZE, NUM_EPOCHS,
    GRAD_CLIP_NORM, WARMUP_STEPS, CHECKPOINT_DIR, LOG_INTERVAL,
    LOSS_WEIGHT_SUITABILITY, LOSS_WEIGHT_RESOURCE,
    LOSS_WEIGHT_TIMELINE, LOSS_WEIGHT_INFRASTRUCTURE,
    TRAIN_DATASET_SIZE, VAL_DATASET_SIZE, NUM_WORKERS, DEVICE,
)
from torch.utils.data import random_split
from model import ColonizerModel, count_parameters
from data_generator import SyntheticColonizationDataset
from nasa_exoplanet_dataset import NASAExoplanetDataset, load_nasa_star_systems


def _save_checkpoint(ckpt, path):
    """Write to a temp file then rename to avoid file-lock issues (e.g. OneDrive)."""
    tmp = path + ".tmp"
    torch.save(ckpt, tmp)
    if os.path.exists(path):
        os.remove(path)
    os.rename(tmp, path)


def get_lr_scheduler(optimizer, warmup_steps, total_steps):
    """Cosine annealing with linear warmup."""
    def lr_lambda(step):
        if step < warmup_steps:
            return step / max(1, warmup_steps)
        progress = (step - warmup_steps) / max(1, total_steps - warmup_steps)
        return 0.5 * (1.0 + __import__('math').cos(__import__('math').pi * progress))
    return torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)


def compute_losses(outputs, batch):
    """Compute multi-task losses."""
    mask = batch["planet_mask"].to(DEVICE)

    # Suitability loss (MSE, per-planet)
    suit_pred = outputs["suitability"]
    suit_target = batch["suitability"].to(DEVICE)
    suit_loss = ((suit_pred - suit_target) ** 2 * mask).sum() / mask.sum().clamp(min=1)

    # Resource loss (MSE, per-planet per-resource)
    res_pred = outputs["resources"]
    res_target = batch["resources"].to(DEVICE)
    res_diff = (res_pred - res_target) ** 2
    res_loss = (res_diff * mask.unsqueeze(-1)).sum() / mask.sum().clamp(min=1)

    # Timeline loss (MSE, system-level)
    time_pred = outputs["timeline"]
    time_target = batch["timeline"].to(DEVICE)
    time_loss = nn.functional.mse_loss(time_pred, time_target)

    # Infrastructure loss (MSE, per-planet)
    infra_pred = outputs["infrastructure"]
    infra_target = batch["infrastructure"].to(DEVICE)
    infra_diff = (infra_pred - infra_target) ** 2
    infra_loss = (infra_diff * mask.unsqueeze(-1)).sum() / mask.sum().clamp(min=1)

    # Weighted total
    total = (LOSS_WEIGHT_SUITABILITY * suit_loss +
             LOSS_WEIGHT_RESOURCE * res_loss +
             LOSS_WEIGHT_TIMELINE * time_loss +
             LOSS_WEIGHT_INFRASTRUCTURE * infra_loss)

    return {
        "total": total,
        "suitability": suit_loss.item(),
        "resource": res_loss.item(),
        "timeline": time_loss.item(),
        "infrastructure": infra_loss.item(),
    }


def train_epoch(model, dataloader, optimizer, scheduler, epoch, global_step):
    """Train for one epoch."""
    model.train()
    epoch_losses = {"total": 0, "suitability": 0, "resource": 0, "timeline": 0, "infrastructure": 0}
    n_batches = 0

    for batch_idx, batch in enumerate(dataloader):
        star = batch["star_features"].to(DEVICE)
        planets = batch["planet_features"].to(DEVICE)
        mask = batch["planet_mask"].to(DEVICE)

        optimizer.zero_grad()
        outputs = model(star, planets, mask)
        losses = compute_losses(outputs, batch)

        losses["total"].backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), GRAD_CLIP_NORM)
        optimizer.step()
        scheduler.step()

        global_step += 1
        n_batches += 1

        for k in epoch_losses:
            if k == "total":
                epoch_losses[k] += losses[k].item()
            else:
                epoch_losses[k] += losses[k]

        if (batch_idx + 1) % LOG_INTERVAL == 0:
            avg = epoch_losses["total"] / n_batches
            lr = scheduler.get_last_lr()[0]
            print(f"  Epoch {epoch+1} [{batch_idx+1}/{len(dataloader)}] "
                  f"loss={avg:.4f} lr={lr:.2e}")

    for k in epoch_losses:
        epoch_losses[k] /= max(1, n_batches)

    return epoch_losses, global_step


def validate(model, dataloader):
    """Validate the model."""
    model.eval()
    val_losses = {"total": 0, "suitability": 0, "resource": 0, "timeline": 0, "infrastructure": 0}
    n_batches = 0

    with torch.no_grad():
        for batch in dataloader:
            star = batch["star_features"].to(DEVICE)
            planets = batch["planet_features"].to(DEVICE)
            mask = batch["planet_mask"].to(DEVICE)

            outputs = model(star, planets, mask)
            losses = compute_losses(outputs, batch)

            n_batches += 1
            for k in val_losses:
                if k == "total":
                    val_losses[k] += losses[k].item()
                else:
                    val_losses[k] += losses[k]

    for k in val_losses:
        val_losses[k] /= max(1, n_batches)

    return val_losses


def train(epochs=None, batch_size=None, resume_from=None, dataset="synthetic"):
    """Full training loop.

    Args:
        dataset: "synthetic" (default) or "nasa" to use the NASA Exoplanet Archive.
    """
    epochs = epochs or NUM_EPOCHS
    batch_size = batch_size or BATCH_SIZE

    print("=" * 60)
    print("COLONIZER AI — TRAINING")
    print("=" * 60)
    print(f"Device:  {DEVICE}")
    print(f"Dataset: {dataset}")
    print(f"Epochs:  {epochs}, Batch size: {batch_size}")
    print()

    # Data
    if dataset == "nasa":
        systems = load_nasa_star_systems()
        n_val = max(1, int(len(systems) * 0.1))
        n_train = len(systems) - n_val
        train_dataset, val_dataset = random_split(
            NASAExoplanetDataset(systems),
            [n_train, n_val],
            generator=torch.Generator().manual_seed(42),
        )
        print(f"NASA split: {n_train} train / {n_val} val systems")
    else:
        train_dataset = SyntheticColonizationDataset(TRAIN_DATASET_SIZE, seed=42)
        val_dataset = SyntheticColonizationDataset(VAL_DATASET_SIZE, seed=99999)

    train_loader = DataLoader(train_dataset, batch_size=batch_size,
                              shuffle=True, num_workers=NUM_WORKERS)
    val_loader = DataLoader(val_dataset, batch_size=batch_size,
                            shuffle=False, num_workers=NUM_WORKERS)

    # Model
    model = ColonizerModel().to(DEVICE)
    count_parameters(model)

    # Optimizer
    optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE,
                                   weight_decay=WEIGHT_DECAY)
    total_steps = epochs * len(train_loader)
    scheduler = get_lr_scheduler(optimizer, WARMUP_STEPS, total_steps)

    # Resume
    start_epoch = 0
    global_step = 0
    best_val_loss = float('inf')

    if resume_from and os.path.exists(resume_from):
        print(f"Resuming from checkpoint: {resume_from}")
        ckpt = torch.load(resume_from, map_location=DEVICE, weights_only=False)
        model.load_state_dict(ckpt["model_state_dict"])
        optimizer.load_state_dict(ckpt["optimizer_state_dict"])
        start_epoch = ckpt.get("epoch", 0) + 1
        global_step = ckpt.get("global_step", 0)
        best_val_loss = ckpt.get("best_val_loss", float('inf'))
        print(f"Resumed at epoch {start_epoch}, step {global_step}")

    os.makedirs(CHECKPOINT_DIR, exist_ok=True)

    # Training loop
    print(f"\nStarting training from epoch {start_epoch}...")
    for epoch in range(start_epoch, epochs):
        t0 = time.time()

        train_losses, global_step = train_epoch(
            model, train_loader, optimizer, scheduler, epoch, global_step
        )
        val_losses = validate(model, val_loader)

        elapsed = time.time() - t0

        print(f"\nEpoch {epoch+1}/{epochs} ({elapsed:.1f}s)")
        print(f"  Train — total: {train_losses['total']:.4f} | "
              f"suit: {train_losses['suitability']:.4f} | "
              f"res: {train_losses['resource']:.4f} | "
              f"time: {train_losses['timeline']:.4f} | "
              f"infra: {train_losses['infrastructure']:.4f}")
        print(f"  Val   — total: {val_losses['total']:.4f} | "
              f"suit: {val_losses['suitability']:.4f} | "
              f"res: {val_losses['resource']:.4f} | "
              f"time: {val_losses['timeline']:.4f} | "
              f"infra: {val_losses['infrastructure']:.4f}")

        # Save checkpoint
        is_best = val_losses["total"] < best_val_loss
        if is_best:
            best_val_loss = val_losses["total"]
            print(f"  * New best val loss: {best_val_loss:.4f}")

        ckpt = {
            "epoch": epoch,
            "global_step": global_step,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "train_losses": train_losses,
            "val_losses": val_losses,
            "best_val_loss": best_val_loss,
        }
        _save_checkpoint(ckpt, os.path.join(CHECKPOINT_DIR, "latest.pt"))
        if is_best:
            _save_checkpoint(ckpt, os.path.join(CHECKPOINT_DIR, "best.pt"))

    print(f"\nTraining complete! Best val loss: {best_val_loss:.4f}")
    print(f"Checkpoints saved to {CHECKPOINT_DIR}/")
    return model


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Colonizer AI")
    parser.add_argument("--epochs", type=int, default=NUM_EPOCHS)
    parser.add_argument("--batch-size", type=int, default=BATCH_SIZE)
    parser.add_argument("--resume", type=str, default=None, help="Resume from checkpoint")
    parser.add_argument("--dataset", choices=["synthetic", "nasa"], default="synthetic",
                        help="Training data source (default: synthetic)")
    args = parser.parse_args()

    train(epochs=args.epochs, batch_size=args.batch_size,
          resume_from=args.resume, dataset=args.dataset)
