"""
CogniSol - ML Classifier Service
Layer 4: Real classification using trained XGBoost models.
Replaces mock_classifier.py with actual ML predictions.
"""

import os
import numpy as np
import joblib
from datetime import datetime, timedelta
from config.settings import Config
from services.preprocessing import clean_text
from services.feature_engine import extract_keyword_features

# SLA hours mapping
SLA_HOURS = {
    "high": Config.SLA_HIGH_HOURS,
    "medium": Config.SLA_MEDIUM_HOURS,
    "low": Config.SLA_LOW_HOURS,
}

# ── Global model references (loaded once at startup) ──
_category_model = None
_priority_model = None
_feature_engineer = None
_label_encoders = None
_models_loaded = False


def load_models():
    """
    Load trained models from disk. Called once at app startup.
    Returns True if models loaded successfully, False if falling back to rules.
    """
    global _category_model, _priority_model, _feature_engineer, _label_encoders, _models_loaded
    
    models_dir = os.path.join(os.path.dirname(__file__), "trained_models")
    
    required_files = [
        "category_model.joblib",
        "priority_model.joblib",
        "feature_engineer.joblib",
        "label_encoders.joblib",
    ]
    
    # Check if all model files exist
    for fname in required_files:
        fpath = os.path.join(models_dir, fname)
        if not os.path.exists(fpath):
            print(f"[CogniSol] WARNING: Model file not found: {fpath}")
            print("[CogniSol] Falling back to rule-based classification.")
            print("[CogniSol] Run 'python -m services.train_model' to train models.")
            _models_loaded = False
            return False
    
    try:
        _category_model = joblib.load(os.path.join(models_dir, "category_model.joblib"))
        _priority_model = joblib.load(os.path.join(models_dir, "priority_model.joblib"))
        _feature_engineer = joblib.load(os.path.join(models_dir, "feature_engineer.joblib"))
        _label_encoders = joblib.load(os.path.join(models_dir, "label_encoders.joblib"))
        _models_loaded = True
        print("[CogniSol] ML models loaded successfully!")
        return True
    except Exception as e:
        print(f"[CogniSol] ERROR loading models: {e}")
        print("[CogniSol] Falling back to rule-based classification.")
        _models_loaded = False
        return False


def _rule_based_classify(text):
    """
    Fallback rule-based classification using keyword matching.
    Used when ML models are not available.
    """
    text_lower = text.lower()
    keyword_feats = extract_keyword_features(text_lower)
    
    # keyword_feats: [high_urgency, med_urgency, urgency_score, product_score, packaging_score, trade_score]
    product_score = keyword_feats[3]
    packaging_score = keyword_feats[4]
    trade_score = keyword_feats[5]
    
    # Category from highest keyword score
    scores = {"Product": product_score, "Packaging": packaging_score, "Trade": trade_score}
    category = max(scores, key=scores.get) if max(scores.values()) > 0 else "Product"
    
    # Priority from urgency
    urgency = keyword_feats[2]
    if urgency >= 0.6 or keyword_feats[0] >= 2:
        priority = "high"
    elif urgency >= 0.3 or keyword_feats[1] >= 2:
        priority = "medium"
    else:
        priority = "low"
    
    # Confidence based on keyword match strength
    max_score = max(scores.values())
    confidence = min(0.60 + max_score * 0.08, 0.92)
    
    return category, priority, round(confidence, 2), round(urgency, 2)


def classify_complaint(complaint_text, channel='web'):
    """
    Classify a complaint using trained ML models or rule-based fallback.
    
    Args:
        complaint_text: str - Raw complaint text
        channel: str - Input channel (call/email/web)
    
    Returns:
        dict with keys:
            - category: str (Product, Packaging, Trade)
            - priority: str (high, medium, low)
            - confidence: float (0.0 - 1.0)
            - urgency_score: float (0.0 - 1.0)
            - sla_deadline: datetime
            - classification_method: str ('ml' or 'rule_based')
    """
    # Clean text for ML processing
    cleaned = clean_text(complaint_text)
    
    if _models_loaded and _feature_engineer and _category_model and _priority_model:
        # ── ML-based classification ──
        try:
            features = _feature_engineer.transform_single(cleaned, channel)
            
            # GBM 1: Category
            cat_pred = _category_model.predict(features)[0]
            cat_proba = _category_model.predict_proba(features)[0]
            category = _label_encoders['category'].inverse_transform([cat_pred])[0]
            cat_confidence = float(np.max(cat_proba))
            
            # GBM 2: Priority
            pri_pred = _priority_model.predict(features)[0]
            pri_proba = _priority_model.predict_proba(features)[0]
            priority = _label_encoders['priority'].inverse_transform([pri_pred])[0]
            priority = priority.lower()
            
            # Calculate urgency score from keyword features
            keyword_feats = extract_keyword_features(complaint_text)
            urgency_score = float(keyword_feats[2])
            
            method = "ml"
            confidence = round(cat_confidence, 2)
            
        except Exception as e:
            print(f"[CogniSol] ML prediction failed: {e}, falling back to rules")
            category, priority, confidence, urgency_score = _rule_based_classify(complaint_text)
            method = "rule_based"
    else:
        # ── Rule-based fallback ──
        category, priority, confidence, urgency_score = _rule_based_classify(complaint_text)
        method = "rule_based"
    
    # Calculate SLA deadline
    sla_deadline = datetime.now() + timedelta(hours=SLA_HOURS.get(priority, 24))
    
    return {
        "category": str(category),
        "priority": str(priority),
        "confidence": float(confidence),
        "urgency_score": float(urgency_score),
        "sla_deadline": sla_deadline,
        "classification_method": method,
    }
