"""
CogniSol - ML Classifier Service
Layer 4: Real classification using trained Logistic Regression models.
Includes prediction explainability (top keywords + priority reason).
Falls back to rule-based classification when models aren't available.
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

# Priority reason templates — human-readable explanations
PRIORITY_REASONS = {
    "high": {
        "keyword": "Contains urgent language ({keywords}), indicating immediate attention required.",
        "ml": "ML model detected high-severity patterns with {confidence}% confidence. Key signals: {keywords}.",
        "default": "Classified as high priority based on complaint severity indicators.",
    },
    "medium": {
        "keyword": "Contains moderate concern indicators ({keywords}), suggesting timely follow-up needed.",
        "ml": "ML model detected moderate-severity patterns with {confidence}% confidence. Key signals: {keywords}.",
        "default": "Classified as medium priority based on standard complaint patterns.",
    },
    "low": {
        "keyword": "Standard inquiry with no urgency markers detected.",
        "ml": "ML model detected low-severity patterns with {confidence}% confidence. Routine processing recommended.",
        "default": "Classified as low priority — no urgency indicators found.",
    },
}

# ── Global model references (loaded once at startup) ──
_category_model = None
_priority_model = None
_feature_engineer = None
_label_encoders = None
_keyword_importance = None
_models_loaded = False


def load_models():
    """
    Load trained models from disk. Called once at app startup.
    Returns True if models loaded successfully, False if falling back to rules.
    """
    global _category_model, _priority_model, _feature_engineer
    global _label_encoders, _keyword_importance, _models_loaded
    
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
        
        # Load keyword importance (optional — for explainability)
        ki_path = os.path.join(models_dir, "keyword_importance.joblib")
        if os.path.exists(ki_path):
            _keyword_importance = joblib.load(ki_path)
            print("[CogniSol] Keyword importance loaded (explainability active).")
        
        _models_loaded = True
        print("[CogniSol] ML models loaded successfully! (Logistic Regression)")
        return True
    except Exception as e:
        print(f"[CogniSol] ERROR loading models: {e}")
        print("[CogniSol] Falling back to rule-based classification.")
        _models_loaded = False
        return False


def _get_urgency_keywords(text):
    """Extract which urgency keywords are present in the text for explanation."""
    text_lower = text.lower()
    
    high_words = [
        'urgent', 'immediately', 'asap', 'critical', 'emergency', 'broken',
        'destroyed', 'hazard', 'dangerous', 'toxic', 'harm', 'injury',
        'legal', 'lawsuit', 'contaminated', 'recall', 'allergic', 'severe', 'terrible',
    ]
    medium_words = [
        'damaged', 'defective', 'incorrect', 'wrong', 'missing', 'delayed',
        'late', 'poor', 'bad', 'disappointed', 'unhappy', 'frustrated',
        'faulty', 'return',
    ]
    
    found_high = [w for w in high_words if w in text_lower]
    found_medium = [w for w in medium_words if w in text_lower]
    
    return found_high, found_medium


def _generate_priority_reason(priority, text, confidence, method, top_keywords=None):
    """
    Generate a human-readable explanation for why a complaint was assigned 
    a specific priority level.
    
    Returns:
        str: Explanation string
    """
    found_high, found_medium = _get_urgency_keywords(text)
    all_found = found_high + found_medium
    keywords_str = ", ".join(all_found[:5]) if all_found else "general tone"
    
    templates = PRIORITY_REASONS.get(priority, PRIORITY_REASONS["low"])
    
    if method == "ml" and top_keywords:
        # Use ML-based explanation with actual top keywords
        kw_str = ", ".join(top_keywords[:4])
        return templates["ml"].format(
            confidence=f"{confidence*100:.0f}",
            keywords=kw_str if kw_str else keywords_str
        )
    elif all_found:
        return templates["keyword"].format(keywords=keywords_str)
    else:
        return templates["default"]


def _get_top_prediction_keywords(text, category, priority):
    """
    Get the top keywords that influenced the ML prediction for this complaint.
    Uses the pre-computed keyword importance from training.
    
    Returns:
        dict with 'category_keywords' and 'priority_keywords' lists
    """
    if not _keyword_importance:
        return {"category_keywords": [], "priority_keywords": []}
    
    text_lower = text.lower()
    
    # Get category keywords that are actually present in this complaint
    cat_ki = _keyword_importance.get("category", {})
    cat_word_importance = cat_ki.get("keyword_importance", {}).get(category, [])
    cat_keywords = [word for word, _ in cat_word_importance if word in text_lower][:6]
    
    # Get priority keywords that are actually present
    # Capitalize priority for lookup (matches LabelEncoder classes)
    pri_key = priority.title()
    pri_ki = _keyword_importance.get("priority", {})
    pri_word_importance = pri_ki.get("keyword_importance", {}).get(pri_key, [])
    pri_keywords = [word for word, _ in pri_word_importance if word in text_lower][:6]
    
    return {
        "category_keywords": cat_keywords,
        "priority_keywords": pri_keywords,
    }


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
            - priority_reason: str (human-readable explanation)
            - top_keywords: dict (category_keywords + priority_keywords)
            - class_probabilities: dict (per-class probabilities)
    """
    # Clean text for ML processing
    cleaned = clean_text(complaint_text)
    
    if _models_loaded and _feature_engineer and _category_model and _priority_model:
        # ── ML-based classification ──
        try:
            features = _feature_engineer.transform_single(cleaned, channel)
            
            # Model 1: Category prediction
            cat_pred = _category_model.predict(features)[0]
            cat_proba = _category_model.predict_proba(features)[0]
            category = _label_encoders['category'].inverse_transform([cat_pred])[0]
            cat_confidence = float(np.max(cat_proba))
            
            # Build category probability map
            cat_classes = _label_encoders['category'].classes_
            cat_prob_map = {
                str(cls): round(float(prob), 4)
                for cls, prob in zip(cat_classes, cat_proba)
            }
            
            # Model 2: Priority prediction
            pri_pred = _priority_model.predict(features)[0]
            pri_proba = _priority_model.predict_proba(features)[0]
            priority = _label_encoders['priority'].inverse_transform([pri_pred])[0]
            priority = priority.lower()
            
            # Build priority probability map
            pri_classes = _label_encoders['priority'].classes_
            pri_prob_map = {
                str(cls).lower(): round(float(prob), 4)
                for cls, prob in zip(pri_classes, pri_proba)
            }
            
            # Calculate urgency score from keyword features
            keyword_feats = extract_keyword_features(complaint_text)
            urgency_score = float(keyword_feats[2])
            
            # ── Hybrid category validation ──
            # When keyword features strongly indicate a single category but ML disagrees,
            # trust the keyword signal. This catches vocabulary-overlap edge cases.
            product_kw = int(keyword_feats[3])
            packaging_kw = int(keyword_feats[4])
            trade_kw = int(keyword_feats[5])
            kw_scores = {"Product": product_kw, "Packaging": packaging_kw, "Trade": trade_kw}
            max_kw_cat = max(kw_scores, key=kw_scores.get)
            max_kw_score = kw_scores[max_kw_cat]
            second_highest = sorted(kw_scores.values(), reverse=True)[1]
            
            # Override conditions (conservative to avoid false overrides):
            #   Case A: Strong keyword signal (>=2 matches) with clear dominance
            #   Case B: Unique keyword signal (>=1 match, other categories have 0 matches)
            #   Note: ML confidence guard removed for Case B because the small-vocabulary
            #   model produces degenerate 1.0 confidence values that are unreliable.
            has_strong_signal = max_kw_score >= 2 and max_kw_score > second_highest
            has_unique_signal = max_kw_score >= 1 and second_highest == 0
            
            if (has_strong_signal or has_unique_signal) and max_kw_cat != category:
                ml_category = category
                category = max_kw_cat
                print(f"[CogniSol] Category override: ML={ml_category} -> Keyword={category} (kw={kw_scores}, ml_conf={cat_confidence:.2f})")
            
            # ── Hybrid priority override ──
            # The ML priority model has low accuracy (~33%) due to uniform dataset distribution.
            # Use keyword-based urgency as a strong override signal when present.
            ml_priority = priority  # Preserve original ML prediction
            high_kw_count = int(keyword_feats[0])
            med_kw_count = int(keyword_feats[1])
            
            if urgency_score >= 0.6 or high_kw_count >= 2:
                priority = "high"
            elif urgency_score >= 0.3 or med_kw_count >= 2:
                priority = "medium"
            # else: keep ML prediction as-is for low priority
            
            if priority != ml_priority:
                print(f"[CogniSol] Priority override: ML={ml_priority} -> Keyword={priority} (urgency={urgency_score:.2f})")
            
            method = "ml"
            confidence = round(cat_confidence, 2)
            
            # Get prediction explanation keywords
            top_keywords = _get_top_prediction_keywords(complaint_text, category, priority)
            
            # Generate priority reason
            priority_reason = _generate_priority_reason(
                priority, complaint_text, confidence, method,
                top_keywords.get("priority_keywords", [])
            )
            
            class_probabilities = {
                "category": cat_prob_map,
                "priority": pri_prob_map,
            }
            
        except Exception as e:
            print(f"[CogniSol] ML prediction failed: {e}, falling back to rules")
            category, priority, confidence, urgency_score = _rule_based_classify(complaint_text)
            method = "rule_based"
            top_keywords = {"category_keywords": [], "priority_keywords": []}
            priority_reason = _generate_priority_reason(priority, complaint_text, confidence, method)
            class_probabilities = {}
    else:
        # ── Rule-based fallback ──
        category, priority, confidence, urgency_score = _rule_based_classify(complaint_text)
        method = "rule_based"
        top_keywords = {"category_keywords": [], "priority_keywords": []}
        priority_reason = _generate_priority_reason(priority, complaint_text, confidence, method)
        class_probabilities = {}
    
    # Calculate SLA deadline
    sla_deadline = datetime.now() + timedelta(hours=SLA_HOURS.get(priority, 24))
    
    return {
        "category": str(category),
        "priority": str(priority),
        "confidence": float(confidence),
        "urgency_score": float(urgency_score),
        "sla_deadline": sla_deadline,
        "classification_method": method,
        "priority_reason": priority_reason,
        "top_keywords": top_keywords,
        "class_probabilities": class_probabilities,
    }
