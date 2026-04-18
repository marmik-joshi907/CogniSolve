"""
CogniSol - Complaint Model
CRUD operations for the complaints table.
"""

import json
from datetime import datetime
from db.connection import execute_query, execute_query_one


def create_complaint(complaint_text, channel, category, priority, confidence_score, sla_deadline):
    """
    Insert a new complaint into the database.
    
    Returns:
        dict: The created complaint record.
    """
    query = """
        INSERT INTO complaints 
            (complaint_text, channel, category, priority, confidence_score, sla_deadline)
        VALUES 
            (%s, %s, %s, %s, %s, %s)
        RETURNING 
            id, complaint_text, channel, status, category, priority,
            confidence_score, resolution_text, sla_deadline, sla_breached,
            assigned_agent_id, created_at, updated_at
    """
    params = (complaint_text, channel, category, priority, confidence_score, sla_deadline)
    result = execute_query_one(query, params)
    return _serialize_complaint(result)


def get_all_complaints(filters=None):
    """
    Retrieve all complaints with optional filters.
    
    Args:
        filters: dict with optional keys: category, priority, status, channel
    
    Returns:
        list[dict]: List of complaint records.
    """
    query = """
        SELECT 
            id, complaint_text, channel, status, category, priority,
            confidence_score, resolution_text, sla_deadline, sla_breached,
            assigned_agent_id, created_at, updated_at
        FROM complaints
        WHERE 1=1
    """
    params = []

    if filters:
        if filters.get("category"):
            query += " AND category = %s"
            params.append(filters["category"])
        if filters.get("priority"):
            query += " AND priority = %s"
            params.append(filters["priority"])
        if filters.get("status"):
            query += " AND status = %s"
            params.append(filters["status"])
        if filters.get("channel"):
            query += " AND channel = %s"
            params.append(filters["channel"])

    query += " ORDER BY created_at DESC"

    results = execute_query(query, tuple(params) if params else None)
    return [_serialize_complaint(r) for r in results]


def get_complaint_by_id(complaint_id):
    """
    Retrieve a single complaint by ID.
    
    Returns:
        dict or None
    """
    query = """
        SELECT 
            id, complaint_text, channel, status, category, priority,
            confidence_score, resolution_text, sla_deadline, sla_breached,
            assigned_agent_id, created_at, updated_at
        FROM complaints
        WHERE id = %s
    """
    result = execute_query_one(query, (complaint_id,))
    return _serialize_complaint(result) if result else None


def update_complaint_status(complaint_id, new_status):
    """
    Update the status of a complaint.
    
    Args:
        complaint_id: int
        new_status: str (open, in_progress, resolved, closed)
    
    Returns:
        dict or None: Updated complaint record.
    """
    query = """
        UPDATE complaints
        SET status = %s, updated_at = NOW()
        WHERE id = %s
        RETURNING 
            id, complaint_text, channel, status, category, priority,
            confidence_score, resolution_text, sla_deadline, sla_breached,
            assigned_agent_id, created_at, updated_at
    """
    result = execute_query_one(query, (new_status, complaint_id))
    return _serialize_complaint(result) if result else None


def _serialize_complaint(record):
    """Convert a complaint record to a JSON-serializable dict."""
    if not record:
        return None
    serialized = dict(record)
    for key, value in serialized.items():
        if isinstance(value, datetime):
            serialized[key] = value.isoformat()
        elif hasattr(value, "__float__"):
            serialized[key] = float(value)
    return serialized
