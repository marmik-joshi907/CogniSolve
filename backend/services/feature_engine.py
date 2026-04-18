"""
CogniSol - Feature Engineering Pipeline
Layer 3: TF-IDF + SVD + Keyword features + Meta features.
Produces a concatenated feature vector (~200-300 dims) for GBM classifiers.

Note: Sentence embeddings (MiniLM) are optional and only used if sentence-transformers
is installed. The pipeline works without them using TF-IDF+SVD+keywords alone.
"""

import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import StandardScaler

# ── Urgency keyword patterns ──
URGENCY_HIGH = [
    r'\burgent\b', r'\bimmediately\b', r'\basap\b', r'\bcritical\b',
    r'\bemergency\b', r'\bbroken\b', r'\bdestroyed\b', r'\bhazard\b',
    r'\bdangerous\b', r'\btoxic\b', r'\bharm\b', r'\binjury\b',
    r'\blegal\b', r'\blawsuit\b', r'\bcontaminat\w*\b', r'\brecall\b',
    r'\ballergi\w*\b', r'\bsevere\b', r'\bterrible\b',
]

URGENCY_MEDIUM = [
    r'\bdamaged\b', r'\bdefective\b', r'\bincorrect\b', r'\bwrong\b',
    r'\bmissing\b', r'\bdelayed\b', r'\blate\b', r'\bpoor\b',
    r'\bbad\b', r'\bdisappoint\w*\b', r'\bunhappy\b', r'\bcompla\w*\b',
    r'\bfrustr\w*\b', r'\bfaulty\b', r'\breturn\b',
]

CATEGORY_KEYWORDS = {
    'product': [
        r'\bproduct\b', r'\bquality\b', r'\bdefect\w*\b', r'\bexpir\w*\b',
        r'\bingredient\w*\b', r'\beffective\w*\b', r'\bside effect\w*\b',
        r'\bwork\b', r'\bresult\b', r'\breaction\b', r'\bformula\w*\b',
    ],
    'packaging': [
        r'\bpackag\w*\b', r'\bbox\b', r'\bseal\b', r'\blabel\w*\b',
        r'\bwrap\w*\b', r'\bcontainer\b', r'\bbottle\b', r'\btube\b',
        r'\bcarton\b', r'\bdamag\w*\b', r'\bcrushed\b', r'\bleaking\b',
        r'\btorn\b', r'\bopen\w*\b', r'\btamper\w*\b',
    ],
    'trade': [
        r'\btrade\b', r'\bpric\w*\b', r'\bdiscount\b', r'\bbulk\b',
        r'\border\w*\b', r'\bdeliver\w*\b', r'\bship\w*\b', r'\binvoic\w*\b',
        r'\bpayment\b', r'\brefund\b', r'\bdistribut\w*\b', r'\bwholesale\b',
        r'\bretail\b', r'\bstock\b', r'\bavailab\w*\b',
    ],
}

# Channel encoding map
CHANNEL_MAP = {'call': 0, 'email': 1, 'web': 2}


def extract_keyword_features(text):
    """
    Extract keyword-based features using regex patterns.
    
    Returns:
        numpy array of keyword feature scores
    """
    text_lower = text.lower() if text else ""
    
    # Urgency scores
    high_count = sum(1 for p in URGENCY_HIGH if re.search(p, text_lower))
    med_count = sum(1 for p in URGENCY_MEDIUM if re.search(p, text_lower))
    
    # Category keyword scores
    cat_scores = []
    for cat_name, patterns in CATEGORY_KEYWORDS.items():
        score = sum(1 for p in patterns if re.search(p, text_lower))
        cat_scores.append(score)
    
    # Urgency signal (normalized)
    urgency_score = min((high_count * 2 + med_count) / 5.0, 1.0)
    
    return np.array([high_count, med_count, urgency_score] + cat_scores, dtype=np.float64)


def extract_meta_features(text, channel='web'):
    """
    Extract meta features from text and channel.
    
    Returns:
        numpy array of meta features
    """
    if not text:
        return np.zeros(5, dtype=np.float64)
    
    words = text.split()
    word_count = len(words)
    char_count = len(text)
    avg_word_len = sum(len(w) for w in words) / max(word_count, 1)
    has_exclamation = 1.0 if '!' in text else 0.0
    channel_code = float(CHANNEL_MAP.get(channel.lower(), 2))
    
    return np.array([word_count, char_count, avg_word_len, has_exclamation, channel_code],
                    dtype=np.float64)


class FeatureEngineer:
    """
    Complete feature engineering pipeline.
    
    Builds a concatenated feature vector from:
    1. TF-IDF → SVD (100 dims) — sparse bag-of-words reduced to latent topics
    2. Keyword features (6 dims) — urgency + category signals
    3. Meta features (5 dims) — word count, char count, channel, etc.
    
    Total: ~111 dimensions
    """
    
    def __init__(self, svd_components=100, max_tfidf_features=5000):
        self.tfidf = TfidfVectorizer(
            max_features=max_tfidf_features,
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95,
            sublinear_tf=True,
        )
        self._svd_target = svd_components
        self.svd = None  # Created dynamically after TF-IDF fit
        self.scaler = StandardScaler()
        self._fitted = False
    
    def fit(self, texts, channels=None):
        """
        Fit the feature pipeline on training texts.
        
        Args:
            texts: list of preprocessed complaint strings
            channels: list of channel strings (optional)
        """
        # Fit TF-IDF
        tfidf_matrix = self.tfidf.fit_transform(texts)
        
        # Adapt SVD components to actual feature count
        n_features = tfidf_matrix.shape[1]
        actual_components = min(self._svd_target, n_features - 1)
        print(f"       TF-IDF features: {n_features}, SVD components: {actual_components}")
        
        self.svd = TruncatedSVD(n_components=actual_components, random_state=42)
        svd_features = self.svd.fit_transform(tfidf_matrix)
        
        # Build full feature matrix
        keyword_feats = np.array([extract_keyword_features(t) for t in texts])
        
        if channels is None:
            channels = ['web'] * len(texts)
        meta_feats = np.array([extract_meta_features(t, c) for t, c in zip(texts, channels)])
        
        full_features = np.hstack([svd_features, keyword_feats, meta_feats])
        
        # Fit scaler
        self.scaler.fit(full_features)
        self._fitted = True
        
        return self.scaler.transform(full_features)
    
    def transform(self, texts, channels=None):
        """
        Transform new texts into feature vectors.
        
        Args:
            texts: list of preprocessed complaint strings
            channels: list of channel strings (optional)
        
        Returns:
            numpy array of shape (n_samples, n_features)
        """
        if not self._fitted:
            raise RuntimeError("FeatureEngineer must be fitted before transform")
        
        tfidf_matrix = self.tfidf.transform(texts)
        svd_features = self.svd.transform(tfidf_matrix)
        
        keyword_feats = np.array([extract_keyword_features(t) for t in texts])
        
        if channels is None:
            channels = ['web'] * len(texts)
        meta_feats = np.array([extract_meta_features(t, c) for t, c in zip(texts, channels)])
        
        full_features = np.hstack([svd_features, keyword_feats, meta_feats])
        
        return self.scaler.transform(full_features)
    
    def transform_single(self, text, channel='web'):
        """Transform a single text into a feature vector."""
        return self.transform([text], [channel])
