"""
CogniSol - Model Training Script
Trains GBM classifiers on the 50K complaint dataset.

Usage:
    python -m services.train_model

Outputs:
    services/trained_models/
        category_model.joblib     - XGBoost category classifier
        priority_model.joblib     - XGBoost priority classifier
        feature_engineer.joblib   - Fitted FeatureEngineer pipeline
        label_encoders.joblib     - Fitted LabelEncoders
"""

import os
import sys
import time
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
from xgboost import XGBClassifier
import joblib

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.preprocessing import clean_text
from services.feature_engine import FeatureEngineer


def train():
    """Train category and priority classifiers on the complaint dataset."""
    
    print("=" * 60)
    print("CogniSol ML Pipeline - Model Training")
    print("=" * 60)
    
    # ── 1. Load dataset ──
    dataset_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets", "TS-PS14.csv")
    
    if not os.path.exists(dataset_path):
        print(f"[ERROR] Dataset not found at: {dataset_path}")
        sys.exit(1)
    
    print(f"\n[1/6] Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path, encoding='utf-8-sig')
    print(f"       Loaded {len(df)} rows, columns: {list(df.columns)}")
    
    # ── 2. Preprocess text ──
    print("\n[2/6] Preprocessing complaint texts...")
    start = time.time()
    df['cleaned_text'] = df['text'].apply(clean_text)
    
    # Remove empty rows after cleaning
    df = df[df['cleaned_text'].str.len() > 0].reset_index(drop=True)
    print(f"       Cleaned {len(df)} texts in {time.time()-start:.1f}s")
    
    # Print category distribution
    print(f"\n       Category distribution:")
    for cat, count in df['category'].value_counts().items():
        print(f"         {cat}: {count} ({count/len(df)*100:.1f}%)")
    
    print(f"\n       Priority distribution:")
    for pri, count in df['priority'].value_counts().items():
        print(f"         {pri}: {count} ({count/len(df)*100:.1f}%)")
    
    # ── 3. Feature engineering ──
    print("\n[3/6] Building feature vectors (TF-IDF + SVD + Keywords + Meta)...")
    start = time.time()
    
    fe = FeatureEngineer(svd_components=100, max_tfidf_features=5000)
    
    # Use 'web' as default channel since dataset doesn't have channel column
    channels = ['web'] * len(df)
    X = fe.fit(df['cleaned_text'].tolist(), channels)
    
    print(f"       Feature matrix shape: {X.shape}")
    print(f"       Feature engineering completed in {time.time()-start:.1f}s")
    
    # ── 4. Encode labels ──
    print("\n[4/6] Encoding labels...")
    
    cat_encoder = LabelEncoder()
    y_category = cat_encoder.fit_transform(df['category'])
    print(f"       Category classes: {list(cat_encoder.classes_)}")
    
    pri_encoder = LabelEncoder()
    y_priority = pri_encoder.fit_transform(df['priority'])
    print(f"       Priority classes: {list(pri_encoder.classes_)}")
    
    # ── 5. Train models ──
    print("\n[5/6] Training XGBoost classifiers...")
    
    X_train, X_test, y_cat_train, y_cat_test, y_pri_train, y_pri_test = train_test_split(
        X, y_category, y_priority, test_size=0.2, random_state=42, stratify=y_category
    )
    
    # GBM 1: Category classifier
    print("\n  >> Training GBM 1 (Category Classifier)...")
    start = time.time()
    cat_model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric='mlogloss',
        verbosity=0,
    )
    cat_model.fit(X_train, y_cat_train)
    
    cat_pred = cat_model.predict(X_test)
    cat_accuracy = accuracy_score(y_cat_test, cat_pred)
    print(f"     Category accuracy: {cat_accuracy:.4f} ({time.time()-start:.1f}s)")
    print(f"\n     Category Classification Report:")
    print(classification_report(y_cat_test, cat_pred, target_names=cat_encoder.classes_))
    
    # GBM 2: Priority classifier
    print("  >> Training GBM 2 (Priority Classifier)...")
    start = time.time()
    pri_model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric='mlogloss',
        verbosity=0,
    )
    pri_model.fit(X_train, y_pri_train)
    
    pri_pred = pri_model.predict(X_test)
    pri_accuracy = accuracy_score(y_pri_test, pri_pred)
    print(f"     Priority accuracy: {pri_accuracy:.4f} ({time.time()-start:.1f}s)")
    print(f"\n     Priority Classification Report:")
    print(classification_report(y_pri_test, pri_pred, target_names=pri_encoder.classes_))
    
    # ── 6. Save models ──
    print("\n[6/6] Saving trained models...")
    
    models_dir = os.path.join(os.path.dirname(__file__), "trained_models")
    os.makedirs(models_dir, exist_ok=True)
    
    joblib.dump(cat_model, os.path.join(models_dir, "category_model.joblib"))
    joblib.dump(pri_model, os.path.join(models_dir, "priority_model.joblib"))
    joblib.dump(fe, os.path.join(models_dir, "feature_engineer.joblib"))
    joblib.dump({
        'category': cat_encoder,
        'priority': pri_encoder,
    }, os.path.join(models_dir, "label_encoders.joblib"))
    
    print(f"\n       Models saved to: {models_dir}/")
    print(f"         - category_model.joblib")
    print(f"         - priority_model.joblib")
    print(f"         - feature_engineer.joblib")
    print(f"         - label_encoders.joblib")
    
    print("\n" + "=" * 60)
    print(f"Training complete!")
    print(f"  Category accuracy: {cat_accuracy:.4f}")
    print(f"  Priority accuracy: {pri_accuracy:.4f}")
    print("=" * 60)


if __name__ == "__main__":
    train()
