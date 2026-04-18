"""
CogniSol - Mock Classifier Service
Temporary mock AI that returns random classification results.
Will be replaced with TF-IDF + SVD + MiniLM + XGBoost in Phase 2.
"""

import random
from datetime import datetime, timedelta
from config.settings import Config

# Classification categories (matches classification_labels table)
CATEGORIES = ["Product", "Packaging", "Trade"]

# Priority levels
PRIORITIES = ["high", "medium", "low"]

# SLA hours mapping
SLA_HOURS = {
    "high": Config.SLA_HIGH_HOURS,
    "medium": Config.SLA_MEDIUM_HOURS,
    "low": Config.SLA_LOW_HOURS,
}


def classify_complaint(complaint_text):
    """
    Mock classification of a complaint.
    
    In Phase 2, this will be replaced with:
    - TF-IDF + SVD for feature extraction
    - MiniLM for semantic embeddings
    - XGBoost for classification
    
    Args:
        complaint_text: str - The complaint text to classify
    
    Returns:
        dict with keys:
            - category: str (Product, Packaging, or Trade)
            - priority: str (high, medium, or low)
            - confidence: float (0.60 - 0.99)
            - sla_deadline: datetime (based on priority)
    """
    category = random.choice(CATEGORIES)
    priority = random.choice(PRIORITIES)
    confidence = round(random.uniform(0.60, 0.99), 2)
    sla_deadline = datetime.now() + timedelta(hours=SLA_HOURS[priority])

    return {
        "category": category,
        "priority": priority,
        "confidence": confidence,
        "sla_deadline": sla_deadline,
    }
