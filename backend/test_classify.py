"""Quick test of the classifier directly."""
from services.classifier import classify_complaint, load_models
load_models()

text = "The product is completely broken and contaminated. This is dangerous and I need an urgent recall immediately!"
r = classify_complaint(text, "web")

print(f"category={r['category']}")
print(f"priority={r['priority']}")
print(f"confidence={r['confidence']}")
print(f"urgency_score={r['urgency_score']}")
print(f"method={r['classification_method']}")
print(f"class_probs={r['class_probabilities']}")
print(f"priority_reason={r['priority_reason']}")
