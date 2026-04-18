"""
CogniSol - SLA Model
Operations for the sla_events table.
"""

import json
from db.connection import execute_query, execute_query_one


def create_sla_event(complaint_id, event_type, event_data=None):
    """
    Record an SLA lifecycle event.
    
    Args:
        complaint_id: int
        event_type: str (created, assigned, escalated, breached, resolved, closed)
        event_data: dict (optional metadata)
    
    Returns:
        dict: The created SLA event record.
    """
    query = """
        INSERT INTO sla_events (complaint_id, event_type, event_data)
        VALUES (%s, %s, %s)
        RETURNING id, complaint_id, event_type, event_data, created_at
    """
    data_json = json.dumps(event_data) if event_data else "{}"
    return execute_query_one(query, (complaint_id, event_type, data_json))


def get_sla_events_for_complaint(complaint_id):
    """Retrieve all SLA events for a specific complaint."""
    query = """
        SELECT id, complaint_id, event_type, event_data, created_at
        FROM sla_events
        WHERE complaint_id = %s
        ORDER BY created_at ASC
    """
    return execute_query(query, (complaint_id,))
