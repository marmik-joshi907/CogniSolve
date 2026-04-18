"""
CogniSol - Model Training Script
Trains Logistic Regression classifiers on the 50K complaint dataset.

Uses TF-IDF + keyword/meta features via the FeatureEngineer pipeline.
Extracts top keywords per category for prediction explainability.

Usage:
    python -m services.train_model

Outputs:
    services/trained_models/
        category_model.joblib     - Logistic Regression category classifier
        priority_model.joblib     - Logistic Regression priority classifier
        feature_engineer.joblib   - Fitted FeatureEngineer pipeline
        label_encoders.joblib     - Fitted LabelEncoders
        keyword_importance.joblib - Top keywords per category/priority
"""

import os
import sys
import time
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.preprocessing import clean_text
from services.feature_engine import FeatureEngineer


def _print_confusion_matrix(y_true, y_pred, class_names, title="Confusion Matrix"):
    """Pretty-print a confusion matrix."""
    cm = confusion_matrix(y_true, y_pred)
    print(f"\n     {title}:")
    
    # Header
    header = "           " + "  ".join(f"{c:>10s}" for c in class_names)
    print(header)
    print("           " + "-" * (12 * len(class_names)))
    
    # Rows
    for i, row in enumerate(cm):
        row_str = "  ".join(f"{v:>10d}" for v in row)
        print(f"  {class_names[i]:>8s} | {row_str}")
    print()


def _extract_keyword_importance(model, feature_engineer, label_encoder, top_n=15):
    """
    Extract top influencing keywords from Logistic Regression coefficients.
    
    For each class, returns the top_n features with highest positive coefficients,
    which indicate the strongest signals for that class.

    Returns:
        dict: {class_name: [(feature_name, coefficient), ...]}
    """
    # Get TF-IDF feature names
    tfidf_feature_names = feature_engineer.tfidf.get_feature_names_out().tolist()
    
    # SVD reduces TF-IDF to N dimensions — we track SVD component indices
    n_svd = feature_engineer.svd.n_components
    svd_names = [f"svd_{i}" for i in range(n_svd)]
    
    # Keyword feature names (from feature_engine.py)
    keyword_names = [
        "high_urgency_count", "med_urgency_count", "urgency_score",
        "product_score", "packaging_score", "trade_score"
    ]
    
    # Meta feature names
    meta_names = ["word_count", "char_count", "avg_word_len", "has_exclamation", "channel_code"]
    
    all_feature_names = svd_names + keyword_names + meta_names
    
    importance = {}
    classes = label_encoder.classes_
    coef = model.coef_  # shape: (n_classes, n_features) for multiclass
    
    for idx, class_name in enumerate(classes):
        class_coef = coef[idx] if len(coef.shape) > 1 else coef[0]
        
        # Get indices of top positive coefficients
        top_indices = np.argsort(class_coef)[::-1][:top_n]
        
        top_features = []
        for i in top_indices:
            if i < len(all_feature_names):
                feat_name = all_feature_names[i]
                top_features.append((feat_name, float(class_coef[i])))
        
        importance[class_name] = top_features
    
    # Also extract top TF-IDF terms that map to each SVD component
    # This lets us explain predictions using actual words
    tfidf_word_importance = {}
    svd_components = feature_engineer.svd.components_  # shape: (n_components, n_tfidf_features)
    
    for cls_idx, class_name in enumerate(classes):
        class_coef = coef[cls_idx] if len(coef.shape) > 1 else coef[0]
        
        # Weight SVD components by their class coefficients
        # Only use SVD portion of coefficients
        svd_coefs = class_coef[:n_svd]
        
        # Compute weighted contribution of each original TF-IDF term
        # weighted_terms = svd_coefs @ svd_components → shape (n_tfidf_features,)
        weighted_terms = svd_coefs @ svd_components
        
        # Get top positive terms (words that push toward this class)
        top_term_indices = np.argsort(weighted_terms)[::-1][:top_n]
        top_words = []
        for i in top_term_indices:
            if weighted_terms[i] > 0:
                top_words.append((tfidf_feature_names[i], float(weighted_terms[i])))
        
        tfidf_word_importance[class_name] = top_words
    
    return {
        "feature_importance": importance,
        "keyword_importance": tfidf_word_importance,
    }


def train():
    """Train category and priority classifiers on the complaint dataset."""
    
    print("=" * 60)
    print("CogniSol ML Pipeline - Model Training")
    print("Model: TF-IDF + SVD + Logistic Regression")
    print("=" * 60)
    
    # ── 1. Load dataset ──
    dataset_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets", "TS-PS14.csv")
    
    if not os.path.exists(dataset_path):
        print(f"[ERROR] Dataset not found at: {dataset_path}")
        sys.exit(1)
    
    print(f"\n[1/7] Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path, encoding='utf-8-sig')
    print(f"       Loaded {len(df)} rows, columns: {list(df.columns)}")
    
    # ── 2. Preprocess text ──
    print("\n[2/7] Preprocessing complaint texts...")
    start = time.time()
    df['cleaned_text'] = df['text'].apply(clean_text)
    
    # Remove empty rows after cleaning
    df = df[df['cleaned_text'].str.len() > 0].reset_index(drop=True)
    print(f"       Cleaned {len(df)} texts in {time.time()-start:.1f}s")
    
    # Normalize category and priority values
    df['category'] = df['category'].str.strip().str.title()
    df['priority'] = df['priority'].str.strip().str.title()
    
    # Print distributions
    print(f"\n       Category distribution:")
    for cat, count in df['category'].value_counts().items():
        print(f"         {cat}: {count} ({count/len(df)*100:.1f}%)")
    
    print(f"\n       Priority distribution:")
    for pri, count in df['priority'].value_counts().items():
        print(f"         {pri}: {count} ({count/len(df)*100:.1f}%)")
    
    # ── 3. Feature engineering ──
    print("\n[3/7] Building feature vectors (TF-IDF + SVD + Keywords + Meta)...")
    start = time.time()
    
    fe = FeatureEngineer(svd_components=100, max_tfidf_features=5000)
    
    # Use 'web' as default channel since dataset doesn't have channel column
    channels = ['web'] * len(df)
    X = fe.fit(df['cleaned_text'].tolist(), channels)
    
    print(f"       Feature matrix shape: {X.shape}")
    print(f"       Feature engineering completed in {time.time()-start:.1f}s")
    
    # ── 4. Encode labels ──
    print("\n[4/7] Encoding labels...")
    
    cat_encoder = LabelEncoder()
    y_category = cat_encoder.fit_transform(df['category'])
    print(f"       Category classes: {list(cat_encoder.classes_)}")
    
    pri_encoder = LabelEncoder()
    y_priority = pri_encoder.fit_transform(df['priority'])
    print(f"       Priority classes: {list(pri_encoder.classes_)}")
    
    # ── 5. Train models ──
    print("\n[5/7] Training Logistic Regression classifiers...")
    
    X_train, X_test, y_cat_train, y_cat_test, y_pri_train, y_pri_test = train_test_split(
        X, y_category, y_priority, test_size=0.2, random_state=42, stratify=y_category
    )
    
    # Model 1: Category classifier
    print("\n  >> Training Model 1 (Category Classifier - Logistic Regression)...")
    start = time.time()
    cat_model = LogisticRegression(
        C=1.0,
        max_iter=1000,
        solver='lbfgs',
        random_state=42,
        n_jobs=-1,
    )
    cat_model.fit(X_train, y_cat_train)
    
    cat_pred = cat_model.predict(X_test)
    cat_accuracy = accuracy_score(y_cat_test, cat_pred)
    print(f"     Category accuracy: {cat_accuracy:.4f} ({time.time()-start:.1f}s)")
    print(f"\n     Category Classification Report:")
    print(classification_report(y_cat_test, cat_pred, target_names=cat_encoder.classes_))
    _print_confusion_matrix(y_cat_test, cat_pred, cat_encoder.classes_.tolist(), "Category Confusion Matrix")
    
    # Model 2: Priority classifier
    print("  >> Training Model 2 (Priority Classifier - Logistic Regression)...")
    start = time.time()
    pri_model = LogisticRegression(
        C=1.0,
        max_iter=1000,
        solver='lbfgs',
        random_state=42,
        n_jobs=-1,
    )
    pri_model.fit(X_train, y_pri_train)
    
    pri_pred = pri_model.predict(X_test)
    pri_accuracy = accuracy_score(y_pri_test, pri_pred)
    print(f"     Priority accuracy: {pri_accuracy:.4f} ({time.time()-start:.1f}s)")
    print(f"\n     Priority Classification Report:")
    print(classification_report(y_pri_test, pri_pred, target_names=pri_encoder.classes_))
    _print_confusion_matrix(y_pri_test, pri_pred, pri_encoder.classes_.tolist(), "Priority Confusion Matrix")
    
    # ── 6. Extract keyword importance ──
    print("\n[6/7] Extracting keyword importance for explainability...")
    
    cat_importance = _extract_keyword_importance(cat_model, fe, cat_encoder, top_n=15)
    pri_importance = _extract_keyword_importance(pri_model, fe, pri_encoder, top_n=15)
    
    # Print top keywords per category
    print("\n     Top keywords per CATEGORY:")
    for cls_name, words in cat_importance["keyword_importance"].items():
        top_words = [w[0] for w in words[:8]]
        print(f"       {cls_name}: {', '.join(top_words)}")
    
    print("\n     Top keywords per PRIORITY:")
    for cls_name, words in pri_importance["keyword_importance"].items():
        top_words = [w[0] for w in words[:8]]
        print(f"       {cls_name}: {', '.join(top_words)}")
    
    # ── 7. Save models ──
    print("\n[7/7] Saving trained models...")
    
    models_dir = os.path.join(os.path.dirname(__file__), "trained_models")
    os.makedirs(models_dir, exist_ok=True)
    
    joblib.dump(cat_model, os.path.join(models_dir, "category_model.joblib"))
    joblib.dump(pri_model, os.path.join(models_dir, "priority_model.joblib"))
    joblib.dump(fe, os.path.join(models_dir, "feature_engineer.joblib"))
    joblib.dump({
        'category': cat_encoder,
        'priority': pri_encoder,
    }, os.path.join(models_dir, "label_encoders.joblib"))
    joblib.dump({
        'category': cat_importance,
        'priority': pri_importance,
    }, os.path.join(models_dir, "keyword_importance.joblib"))
    
    print(f"\n       Models saved to: {models_dir}/")
    print(f"         - category_model.joblib     (Logistic Regression)")
    print(f"         - priority_model.joblib      (Logistic Regression)")
    print(f"         - feature_engineer.joblib    (TF-IDF + SVD pipeline)")
    print(f"         - label_encoders.joblib      (Category + Priority)")
    print(f"         - keyword_importance.joblib  (Explainability data)")
    
    print("\n" + "=" * 60)
    print(f"Training complete!")
    print(f"  Category accuracy: {cat_accuracy:.4f}")
    print(f"  Priority accuracy: {pri_accuracy:.4f}")
    print(f"  Model type: Logistic Regression (multinomial)")
    print(f"  Features: TF-IDF(5000) -> SVD(100) + keywords(6) + meta(5) = {X.shape[1]}D")
    print("=" * 60)


if __name__ == "__main__":
    train()
