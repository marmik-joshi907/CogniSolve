"""
CogniSol - Text Preprocessing Pipeline
Layer 2: Tokenization, lowercasing, stop-word removal, noise stripping.
"""

import re
import string


# Common English stop words (inline to avoid NLTK download requirement)
STOP_WORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you',
    'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his',
    'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
    'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
    'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having',
    'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
    'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for',
    'with', 'about', 'against', 'between', 'through', 'during', 'before',
    'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
    'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't',
    'can', 'will', 'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o',
    're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn',
    'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan',
    'shouldn', 'wasn', 'weren', 'won', 'wouldn'
}


def clean_text(text):
    """
    Full preprocessing pipeline for complaint text.
    
    Steps:
        1. Lowercase
        2. Remove URLs
        3. Remove HTML tags
        4. Remove email addresses
        5. Remove special characters (keep alphanumeric + spaces)
        6. Remove extra whitespace
        7. Remove stop words
    
    Args:
        text: Raw complaint string
    
    Returns:
        Cleaned text string
    """
    if not text or not isinstance(text, str):
        return ""
    
    # 1. Lowercase
    text = text.lower()
    
    # 2. Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    
    # 3. Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # 4. Remove email addresses
    text = re.sub(r'\S+@\S+\.\S+', '', text)
    
    # 5. Remove special characters but keep alphanumeric and spaces
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    
    # 6. Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # 7. Remove stop words
    words = text.split()
    words = [w for w in words if w not in STOP_WORDS and len(w) > 1]
    
    return ' '.join(words)


def extract_sentences(text):
    """Split text into sentences for sentence-level processing."""
    if not text:
        return []
    # Simple sentence splitting on period, exclamation, question mark
    sentences = re.split(r'[.!?]+', text)
    return [s.strip() for s in sentences if s.strip()]


def get_text_features(text):
    """
    Extract meta-features from raw text (before cleaning).
    
    Returns:
        dict with text-level metadata
    """
    if not text:
        return {"word_count": 0, "char_count": 0, "sentence_count": 0, "avg_word_len": 0}
    
    words = text.split()
    sentences = extract_sentences(text)
    avg_word_len = sum(len(w) for w in words) / max(len(words), 1)
    
    return {
        "word_count": len(words),
        "char_count": len(text),
        "sentence_count": len(sentences),
        "avg_word_len": round(avg_word_len, 2),
    }
