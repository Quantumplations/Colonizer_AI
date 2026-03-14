"""
Colonizer AI — Main Entry Point
CLI with subcommands for training, inference, and demo.

Usage:
    python main.py train [--epochs N] [--batch-size N]
    python main.py infer [--checkpoint PATH]
    python main.py demo  [--epochs N]
"""

import argparse
import sys


def cmd_train(args):
    """Run training pipeline."""
    from train import train
    train(epochs=args.epochs, batch_size=args.batch_size, resume_from=args.resume)


def cmd_infer(args):
    """Run inference on the Solar System."""
    from inference import run_inference
    run_inference(checkpoint_path=args.checkpoint)


def cmd_demo(args):
    """Full demo: train (short), infer, and open simulator."""
    import os
    import webbrowser

    # Train
    print("Step 1/3: Training model...")
    from train import train
    model = train(epochs=args.epochs, batch_size=args.batch_size)

    # Infer
    print("\nStep 2/3: Running inference on Solar System...")
    from inference import run_inference
    plan = run_inference()

    # Open simulator
    print("\nStep 3/3: Opening 3D simulator...")
    sim_path = os.path.join(os.path.dirname(__file__), "simulator.html")
    if os.path.exists(sim_path):
        abs_path = os.path.abspath(sim_path)
        webbrowser.open(f"file:///{abs_path}")
        print(f"Simulator opened: {abs_path}")
    else:
        print("simulator.html not found!")


def main():
    parser = argparse.ArgumentParser(
        description="Colonizer AI — Star System Colonization Planner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py train --epochs 50
  python main.py infer
  python main.py demo --epochs 10
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Train
    train_parser = subparsers.add_parser("train", help="Train the model")
    train_parser.add_argument("--epochs", type=int, default=100)
    train_parser.add_argument("--batch-size", type=int, default=32)
    train_parser.add_argument("--resume", type=str, default=None)

    # Infer
    infer_parser = subparsers.add_parser("infer", help="Run inference on Solar System")
    infer_parser.add_argument("--checkpoint", type=str, default=None)

    # Demo
    demo_parser = subparsers.add_parser("demo", help="Full demo pipeline")
    demo_parser.add_argument("--epochs", type=int, default=20)
    demo_parser.add_argument("--batch-size", type=int, default=32)

    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        sys.exit(1)

    commands = {
        "train": cmd_train,
        "infer": cmd_infer,
        "demo": cmd_demo,
    }

    commands[args.command](args)


if __name__ == "__main__":
    main()
