"""
CogniSol - Resolution Engine (Layer 5)
Uses Ollama LLM for context-aware resolution recommendations.
Falls back to smart template engine if Ollama is unavailable.
"""

import requests
import json

# Ollama API endpoint
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"  # or "mistral", "gemma2", etc.

# ── Resolution templates (fallback when Ollama is unavailable) ──
RESOLUTION_TEMPLATES = {
    "Product": {
        "high": [
            "IMMEDIATE: Initiate product recall investigation for the affected batch.",
            "ACTION: Send replacement product via express shipping within 24 hours.",
            "ESCALATE: Notify Quality Control team and file incident report #QC-{id}.",
            "FOLLOW-UP: Schedule customer callback within 4 hours to confirm resolution.",
        ],
        "medium": [
            "ACTION: Process product replacement request and ship within 3 business days.",
            "INVESTIGATE: Log product defect details for quarterly quality review.",
            "FOLLOW-UP: Send customer satisfaction survey after replacement delivery.",
        ],
        "low": [
            "ACTION: Provide product usage guidance and troubleshooting tips.",
            "OFFER: Issue 15% discount coupon for next purchase as goodwill gesture.",
            "FOLLOW-UP: Check in with customer after 7 days to ensure satisfaction.",
        ],
    },
    "Packaging": {
        "high": [
            "IMMEDIATE: Arrange express re-shipment of intact product within 24 hours.",
            "INVESTIGATE: Alert warehouse team to inspect current batch packaging integrity.",
            "ESCALATE: File supplier quality alert for packaging material review.",
            "FOLLOW-UP: Customer callback within 4 hours with tracking details.",
        ],
        "medium": [
            "ACTION: Ship replacement with reinforced packaging within 3 business days.",
            "INVESTIGATE: Document packaging damage pattern for logistics review.",
            "FOLLOW-UP: Confirm delivery and product condition with customer.",
        ],
        "low": [
            "ACTION: Offer re-shipment or credit for packaging-related inconvenience.",
            "LOG: Record packaging feedback for supplier performance review.",
            "FOLLOW-UP: Send apology email with expected improvement timeline.",
        ],
    },
    "Trade": {
        "high": [
            "IMMEDIATE: Assign dedicated account manager for trade dispute resolution.",
            "ACTION: Review pricing agreement and correct any billing discrepancies within 24 hours.",
            "ESCALATE: Involve finance team for refund or adjustment processing.",
            "FOLLOW-UP: Schedule call with customer within 4 hours.",
        ],
        "medium": [
            "ACTION: Review order history and pricing terms, provide updated quote within 48 hours.",
            "COORDINATE: Connect customer with regional distribution manager.",
            "FOLLOW-UP: Send revised pricing/delivery schedule within 3 business days.",
        ],
        "low": [
            "ACTION: Provide updated product catalog and bulk order pricing sheet.",
            "ASSIST: Help customer navigate ordering process and available discounts.",
            "FOLLOW-UP: Schedule quarterly account review call.",
        ],
    },
}


def _get_ollama_resolution(complaint_text, category, priority, complaint_id=None):
    """
    Generate resolution recommendation using Ollama LLM.
    
    Returns:
        str: Resolution text from LLM, or None if Ollama is unavailable.
    """
    prompt = f"""You are an expert customer support resolution advisor for a wellness company.

Given this customer complaint, provide 3-4 specific, actionable resolution steps.

COMPLAINT: "{complaint_text}"
CATEGORY: {category}
PRIORITY: {priority.upper()}

Requirements:
- Each step should start with an action label (IMMEDIATE/ACTION/INVESTIGATE/ESCALATE/FOLLOW-UP)
- Be specific and actionable, not generic
- Consider the priority level for urgency of response
- Include timeline for each action
- For high priority: include escalation and immediate response steps
- For medium priority: include investigation and follow-up steps  
- For low priority: include goodwill gestures and preventive measures

Respond ONLY with the numbered resolution steps, nothing else. Keep each step to 1-2 sentences max."""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "num_predict": 300,
                }
            },
            timeout=30,
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get("response", "").strip()
        else:
            return None
            
    except (requests.ConnectionError, requests.Timeout, Exception):
        return None


def _get_template_resolution(category, priority, complaint_id=None):
    """
    Generate resolution using smart template engine (fallback).
    
    Returns:
        str: Resolution steps from templates.
    """
    templates = RESOLUTION_TEMPLATES.get(category, RESOLUTION_TEMPLATES["Product"])
    steps = templates.get(priority, templates["medium"])
    
    # Format with complaint ID if available
    formatted = []
    for i, step in enumerate(steps, 1):
        step_text = step.format(id=complaint_id or "NEW")
        formatted.append(f"{i}. {step_text}")
    
    return "\n".join(formatted)


def generate_resolution(complaint_text, category, priority, complaint_id=None):
    """
    Generate actionable resolution recommendation.
    
    Tries Ollama first, falls back to template engine.
    
    Args:
        complaint_text: str - The complaint text
        category: str - Classified category (Product/Packaging/Trade)
        priority: str - Assigned priority (high/medium/low)
        complaint_id: int - Optional complaint ID for reference
    
    Returns:
        dict with:
            - resolution_text: str - The resolution steps
            - method: str - 'ollama' or 'template'
    """
    # Try Ollama first
    ollama_result = _get_ollama_resolution(complaint_text, category, priority, complaint_id)
    
    if ollama_result:
        return {
            "resolution_text": ollama_result,
            "method": "ollama",
        }
    
    # Fallback to templates
    template_result = _get_template_resolution(category, priority, complaint_id)
    
    return {
        "resolution_text": template_result,
        "method": "template",
    }


def check_ollama_status():
    """Check if Ollama is running and available."""
    try:
        resp = requests.get("http://localhost:11434/api/tags", timeout=3)
        if resp.status_code == 200:
            models = resp.json().get("models", [])
            model_names = [m.get("name", "") for m in models]
            return {
                "available": True,
                "models": model_names,
                "active_model": OLLAMA_MODEL,
            }
    except Exception:
        pass
    
    return {
        "available": False,
        "models": [],
        "active_model": OLLAMA_MODEL,
        "message": "Ollama not running. Using template-based resolution engine.",
    }
