"""
CogniSol - API Input Validation Layer
Provides reusable validation functions for API endpoints.
New module — does NOT modify any existing route logic.
"""

from services.logger import get_logger

logger = get_logger("validators")

# Valid values (mirrors routes/complaints.py but centralized)
VALID_CHANNELS = {"call", "email", "web"}
VALID_STATUSES = {"open", "in_progress", "resolved", "closed"}
VALID_CATEGORIES = {"Product", "Packaging", "Trade", "Other"}
VALID_PRIORITIES = {"high", "medium", "low"}


def validate_complaint_submission(data):
    """
    Validate complaint submission payload.
    
    Args:
        data: dict from request.get_json()
    
    Returns:
        tuple: (is_valid: bool, error_message: str or None, cleaned_data: dict or None)
    """
    if not data:
        return False, "Request body is required", None
    
    text = data.get("text", "")
    if isinstance(text, str):
        text = text.strip()
    
    if not text:
        return False, "Field 'text' is required and cannot be empty", None
    
    if len(text) < 5:
        logger.warning(f"Complaint text suspiciously short: '{text}'")
    
    if len(text) > 10000:
        return False, "Field 'text' exceeds maximum length of 10,000 characters", None
    
    channel = data.get("channel", "")
    if isinstance(channel, str):
        channel = channel.strip().lower()
    
    if channel not in VALID_CHANNELS:
        return False, f"Field 'channel' must be one of: {', '.join(sorted(VALID_CHANNELS))}", None
    
    return True, None, {"text": text, "channel": channel}


def validate_status_update(data):
    """
    Validate status update payload.
    
    Args:
        data: dict from request.get_json()
    
    Returns:
        tuple: (is_valid: bool, error_message: str or None, status: str or None)
    """
    if not data:
        return False, "Request body is required", None
    
    status = data.get("status", "")
    if isinstance(status, str):
        status = status.strip().lower()
    
    if status not in VALID_STATUSES:
        return False, f"Field 'status' must be one of: {', '.join(sorted(VALID_STATUSES))}", None
    
    return True, None, status


def validate_qa_approval(data):
    """
    Validate QA approval payload.
    
    Args:
        data: dict from request.get_json()
    
    Returns:
        tuple: (is_valid: bool, error_message: str or None, cleaned_data: dict or None)
    """
    if not data:
        return False, "Request body is required", None
    
    category = data.get("category", "")
    if isinstance(category, str):
        category = category.strip()
    
    if category and category not in VALID_CATEGORIES:
        logger.warning(f"QA approval with non-standard category: '{category}'")
    
    priority = data.get("priority", "")
    if isinstance(priority, str):
        priority = priority.strip().lower()
    
    if priority and priority not in VALID_PRIORITIES:
        return False, f"Field 'priority' must be one of: {', '.join(sorted(VALID_PRIORITIES))}", None
    
    return True, None, {"category": category, "priority": priority}
