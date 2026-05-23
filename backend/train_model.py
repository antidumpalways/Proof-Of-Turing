"""
Train the ML model for Proof-of-Turing scoring.

Run: python train_model.py
This will generate synthetic training data, train the model,
and save it to backend/models/agent_classifier.pkl
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from analyzers.ml_model import AgentClassifier


def main():
    print("=" * 60)
    print("Proof-of-Turing — ML Model Training")
    print("=" * 60)
    print()

    # Initialize classifier
    classifier = AgentClassifier()

    # Generate synthetic data and train
    print("Generating synthetic training data (3000 samples)...")
    X, y = classifier.generate_synthetic_data(3000)

    print(f"  AI Agents:     {sum(1 for v in y if v == 2)}")
    print(f"  Script/Bots:   {sum(1 for v in y if v == 0)}")
    print(f"  Humans:        {sum(1 for v in y if v == 1)}")
    print()

    # Train
    accuracy = classifier.train(X, y)

    print()
    print(f"Model accuracy: {accuracy:.2%}")
    print(f"Model saved to: {classifier.model_path}")
    print()

    # Quick test
    print("Testing with sample heartbeats...")
    test_ai = [
        {"timestamp": 1000, "action": "swap", "asset": "mETH", "strategy_type": "grid_trading", "amount": 500},
        {"timestamp": 1004, "action": "trade", "asset": "MNT", "strategy_type": "trend_following", "amount": 1200},
        {"timestamp": 1009, "action": "add_liquidity", "asset": "USDY", "strategy_type": "yield_farming", "amount": 3000},
        {"timestamp": 1015, "action": "swap", "asset": "fBTC", "strategy_type": "arbitrage", "amount": 800, "market_event": "price_up_5pct"},
        {"timestamp": 1018, "action": "trade", "asset": "mETH", "strategy_type": "mean_reversion", "amount": 2000},
    ]
    test_script = [
        {"timestamp": 1000, "action": "check_balance", "asset": "MNT", "strategy_type": "fixed_grid", "amount": 100},
        {"timestamp": 1003, "action": "check_balance", "asset": "MNT", "strategy_type": "fixed_grid", "amount": 100},
        {"timestamp": 1006, "action": "swap", "asset": "MNT", "strategy_type": "fixed_grid", "amount": 100},
        {"timestamp": 1009, "action": "check_balance", "asset": "MNT", "strategy_type": "fixed_grid", "amount": 100},
        {"timestamp": 1012, "action": "check_balance", "asset": "MNT", "strategy_type": "fixed_grid", "amount": 100},
    ]

    print("\nAI Agent test:")
    result_ai = classifier.predict(test_ai)
    print(f"  Score: {result_ai.get('ml_score')}/100")
    print(f"  Label: {result_ai.get('ml_label')}")
    print(f"  Confidence: {result_ai.get('ml_confidence')}")

    print("\nScript test:")
    result_script = classifier.predict(test_script)
    print(f"  Score: {result_script.get('ml_score')}/100")
    print(f"  Label: {result_script.get('ml_label')}")
    print(f"  Confidence: {result_script.get('ml_confidence')}")

    print()
    print("=" * 60)
    print("Training complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
