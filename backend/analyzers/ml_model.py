"""
ML Model for Proof-of-Turing Scoring.

Replaces/supplements rule-based analyzers with trained ML models:
- Isolation Forest: Anomaly detection for behavioral patterns
- Random Forest Classifier: Classification of AI vs Human behavior
- Feature engineering pipeline for heartbeat data

The model is trained on synthetic data that simulates:
1. Real AI agent behavior (LLM-based, natural timing, diverse strategies)
2. Script/bot behavior (regular timing, fixed patterns)
3. Human behavior (erratic timing, emotional decisions)
"""
import numpy as np
import joblib
import os
import json
from typing import Dict, List, Any, Optional
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from collections import Counter


class AgentClassifier:
    """
    ML-based agent classifier that distinguishes between AI agents,
    script bots, and human operators.
    
    Uses ensemble of:
    - Isolation Forest for anomaly detection in timing patterns
    - Random Forest for behavioral classification
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or os.path.join(
            os.path.dirname(__file__), "..", "models", "agent_classifier.pkl"
        )
        self.scaler_path = os.path.join(
            os.path.dirname(__file__), "..", "models", "scaler.pkl"
        )
        self.isolation_forest: Optional[IsolationForest] = None
        self.random_forest: Optional[RandomForestClassifier] = None
        self.scaler: Optional[StandardScaler] = None
        self.is_trained = False

        # Try to load pre-trained model
        self._load_model()

    def _load_model(self):
        """Load pre-trained model if available."""
        if os.path.exists(self.model_path):
            try:
                self.random_forest = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.is_trained = True
                print(f"ML Model loaded from {self.model_path}")
            except Exception as e:
                print(f"Could not load model: {e}")

    def _extract_features(self, heartbeats: List[Dict]) -> np.ndarray:
        """
        Extract feature vector from heartbeat data.
        
        Features:
        1. Mean interval between actions
        2. Std deviation of intervals
        3. Coefficient of variation of intervals
        4. Unique actions count
        5. Unique assets count
        6. Unique strategies count
        7. Mean response time (if market events present)
        8. Std of response time
        9. Trade size CV
        10. Heartbeat frequency (heartbeats per hour)
        11. Action entropy (diversity of actions)
        12. Asset entropy
        13. Strategy entropy
        14. Has market events ratio
        15. Night activity ratio (UTC 0-6)
        """
        if len(heartbeats) < 3:
            return np.zeros(15)

        timestamps = []
        actions = []
        assets = []
        strategies = []
        amounts = []
        market_events = []
        hours = []

        for hb in heartbeats:
            ts = hb.get("timestamp", 0)
            timestamps.append(ts)
            actions.append(hb.get("action", "unknown"))
            assets.append(hb.get("asset", "unknown"))
            strategies.append(hb.get("strategy_type", "unknown"))
            amounts.append(hb.get("amount", 0) or 0)
            market_events.append(hb.get("market_event") is not None)
            hours.append((ts % 86400) / 3600)  # Hour of day

        # 1-3: Timing features
        deltas = np.diff(sorted(timestamps))
        deltas = deltas[deltas > 0]
        mean_interval = float(np.mean(deltas)) if len(deltas) > 0 else 0
        std_interval = float(np.std(deltas)) if len(deltas) > 0 else 0
        cv_interval = std_interval / mean_interval if mean_interval > 0 else 0

        # 4-6: Unique counts
        unique_actions = len(set(actions))
        unique_assets = len(set(assets))
        unique_strategies = len(set(strategies))

        # 7-8: Response time
        response_times = []
        for i, hb in enumerate(heartbeats):
            if hb.get("market_event") and hb.get("_market_event_time"):
                rt = hb["timestamp"] - hb["_market_event_time"]
                if rt > 0:
                    response_times.append(rt)
        mean_response = float(np.mean(response_times)) if response_times else 0
        std_response = float(np.std(response_times)) if response_times else 0

        # 9: Trade size CV
        amounts_arr = np.array([a for a in amounts if a > 0])
        if len(amounts_arr) > 3:
            trade_cv = float(np.std(amounts_arr) / np.mean(amounts_arr))
        else:
            trade_cv = 0

        # 10: Frequency
        if len(timestamps) > 1 and max(timestamps) > min(timestamps):
            duration_hours = (max(timestamps) - min(timestamps)) / 3600
            frequency = len(timestamps) / max(duration_hours, 0.1)
        else:
            frequency = 0

        # 11-13: Entropy (Shannon)
        def entropy(items):
            counts = Counter(items)
            total = len(items)
            return -sum((c / total) * np.log2(c / total) for c in counts.values())

        action_entropy = entropy(actions) if actions else 0
        asset_entropy = entropy(assets) if assets else 0
        strategy_entropy = entropy(strategies) if strategies else 0

        # 14: Market event ratio
        market_ratio = sum(market_events) / max(len(market_events), 1)

        # 15: Night activity
        night_ratio = sum(1 for h in hours if h < 6 or h >= 22) / max(len(hours), 1)

        return np.array([
            mean_interval, std_interval, cv_interval,
            unique_actions, unique_assets, unique_strategies,
            mean_response, std_response, trade_cv,
            frequency, action_entropy, asset_entropy,
            strategy_entropy, market_ratio, night_ratio
        ])

    def generate_synthetic_data(self, n_samples: int = 1000) -> tuple:
        """
        Generate synthetic training data simulating:
        - AI agents (label 2): Natural variation, diverse strategies
        - Script bots (label 0): Regular timing, fixed patterns
        - Humans (label 1): Erratic timing, emotional patterns
        """
        np.random.seed(42)
        X = []
        y = []

        # AI Agents (label: 2)
        for _ in range(n_samples // 3):
            features = [
                np.random.exponential(5),  # mean_interval: 3-10s
                np.random.exponential(3),  # std_interval: 1-6s
                np.random.uniform(0.4, 0.9),  # cv_interval: 0.4-0.9
                np.random.randint(3, 6),  # unique_actions
                np.random.randint(2, 5),  # unique_assets
                np.random.randint(3, 7),  # unique_strategies
                np.random.uniform(2, 7),  # mean_response
                np.random.uniform(0.5, 3),  # std_response
                np.random.uniform(0.3, 0.8),  # trade_cv
                np.random.uniform(50, 200),  # frequency
                np.random.uniform(1.5, 2.5),  # action_entropy
                np.random.uniform(1.0, 2.0),  # asset_entropy
                np.random.uniform(1.5, 2.8),  # strategy_entropy
                np.random.uniform(0.2, 0.5),  # market_ratio
                np.random.uniform(0.1, 0.3),  # night_ratio
            ]
            X.append(features)
            y.append(2)

        # Script/Bot (label: 0)
        for _ in range(n_samples // 3):
            features = [
                np.random.uniform(2.8, 3.2),  # mean_interval: very fixed
                np.random.uniform(0.01, 0.1),  # std_interval: near zero
                np.random.uniform(0.003, 0.03),  # cv_interval: very low
                np.random.randint(1, 3),  # unique_actions
                np.random.randint(1, 2),  # unique_assets
                np.random.randint(1, 2),  # unique_strategies
                np.random.uniform(0.01, 0.3),  # mean_response: instant
                np.random.uniform(0.001, 0.05),  # std_response: near zero
                np.random.uniform(0.01, 0.1),  # trade_cv: very uniform
                np.random.uniform(100, 500),  # frequency: high
                np.random.uniform(0, 0.5),  # action_entropy: low
                np.random.uniform(0, 0.1),  # asset_entropy: very low
                np.random.uniform(0, 0.1),  # strategy_entropy: very low
                np.random.uniform(0, 0.1),  # market_ratio: near zero
                np.random.uniform(0.3, 0.5),  # night_ratio: runs 24/7
            ]
            X.append(features)
            y.append(0)

        # Human (label: 1)
        for _ in range(n_samples // 3):
            features = [
                np.random.exponential(30),  # mean_interval: 10-60s
                np.random.exponential(20),  # std_interval: high
                np.random.uniform(0.8, 2.5),  # cv_interval: high
                np.random.randint(2, 5),  # unique_actions
                np.random.randint(1, 3),  # unique_assets
                np.random.randint(1, 3),  # unique_strategies
                np.random.uniform(10, 60),  # mean_response: slow
                np.random.uniform(5, 30),  # std_response: high
                np.random.uniform(0.5, 2.0),  # trade_cv: erratic
                np.random.uniform(10, 60),  # frequency: low
                np.random.uniform(1.0, 2.0),  # action_entropy
                np.random.uniform(0.5, 1.0),  # asset_entropy
                np.random.uniform(0.5, 1.5),  # strategy_entropy
                np.random.uniform(0.05, 0.2),  # market_ratio: low
                np.random.uniform(0.5, 0.8),  # night_ratio: human sleep
            ]
            X.append(features)
            y.append(1)

        return np.array(X), np.array(y)

    def train(self, X: Optional[np.ndarray] = None, y: Optional[np.ndarray] = None):
        """
        Train the ML model on heartbeat data.
        If no data provided, generates synthetic training data.
        """
        if X is None or y is None:
            print("Generating synthetic training data...")
            X, y = self.generate_synthetic_data(3000)

        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # Train Random Forest
        print("Training Random Forest classifier...")
        self.random_forest = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            random_state=42,
            class_weight="balanced",
        )
        self.random_forest.fit(X_scaled, y)

        # Train Isolation Forest for anomaly detection
        print("Training Isolation Forest...")
        self.isolation_forest = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100,
        )
        self.isolation_forest.fit(X_scaled)

        self.is_trained = True

        # Evaluate
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        accuracy = self.random_forest.score(X_test, y_test)
        print(f"Model accuracy: {accuracy:.2%}")

        # Save model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.random_forest, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        print(f"Model saved to {self.model_path}")

        return accuracy

    def predict(self, heartbeats: List[Dict]) -> Dict[str, Any]:
        """
        Predict whether a set of heartbeats belongs to an AI agent,
        script bot, or human.

        Returns dict with prediction results.
        """
        features = self._extract_features(heartbeats).reshape(1, -1)

        if not self.is_trained or self.random_forest is None or self.scaler is None:
            return {
                "ml_score": 0,
                "ml_label": -1,
                "ml_confidence": 0,
                "is_trained": False,
                "message": "Model not trained yet",
            }

        try:
            features_scaled = self.scaler.transform(features)

            # Random Forest prediction
            label = int(self.random_forest.predict(features_scaled)[0])
            proba = self.random_forest.predict_proba(features_scaled)[0]
            confidence = float(max(proba))

            # Isolation Forest anomaly score
            if self.isolation_forest is not None:
                anomaly_score = float(self.isolation_forest.score_samples(features_scaled)[0])
                anomaly_score = max(-1, min(1, anomaly_score / 3 + 0.5))  # Normalize to 0-1
            else:
                anomaly_score = 0.5

            # Map label to score (0-100)
            # label 2 (AI) → high score
            # label 1 (Human) → medium score
            # label 0 (Script) → low score
            label_map = {2: 85, 1: 45, 0: 20}
            base_score = label_map.get(label, 50)

            # Adjust score with confidence and anomaly
            ml_score = int(base_score * confidence + anomaly_score * 30)
            ml_score = max(0, min(100, ml_score))

            label_names = {2: "ai_agent", 1: "human", 0: "script"}
            return {
                "ml_score": ml_score,
                "ml_label": label_names.get(label, "unknown"),
                "ml_confidence": round(confidence, 3),
                "anomaly_score": round(anomaly_score, 3),
                "is_trained": True,
                "feature_vector": features.tolist()[0],
            }

        except Exception as e:
            return {
                "ml_score": 0,
                "ml_label": "error",
                "ml_confidence": 0,
                "is_trained": True,
                "error": str(e),
            }
