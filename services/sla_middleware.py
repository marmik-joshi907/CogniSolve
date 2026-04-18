"""
CogniSol - SLA Auto-Check Middleware
Automatically checks for SLA breaches during dashboard stats requests.
New module — wraps existing logic, does NOT modify existing routes.

Usage: Import and call auto_check_sla_breaches() from dashboard route 
       or register as a before_request handler.
"""

from datetime import datetime
from db.connection import execute_query
from models.sla import create_sla_event
from services.logger import get_logger

logger = get_logger("sla_middleware")

# Throttle: run at most once every 60 seconds
_last_check_time = None
_CHECK_INTERVAL_SECONDS = 60


def auto_check_sla_breaches():
    """
    Lightweight SLA breach detector.
    Scans for open/in_progress complaints past their SLA deadline
    and marks them as breached. Throttled to avoid excessive DB load.
    
    Returns:
        dict: { breached_count, breached_ids } or None if throttled
    """
    global _last_check_time
    
    now = datetime.now()
    
    # Throttle check
    if _last_check_time and (now - _last_check_time).total_seconds() < _CHECK_INTERVAL_SECONDS:
        return None
    
    _last_check_time = now
    
    try:
        overdue = execute_query("""
            SELECT id, priority, sla_deadline
            FROM complaints
            WHERE sla_breached = FALSE
              AND sla_deadline IS NOT NULL
              AND sla_deadline < NOW()
              AND status NOT IN ('resolved', 'closed')
        """)
        
        if not overdue:
            return {"breached_count": 0, "breached_ids": []}
        
        breached_ids = []
        
        for complaint in overdue:
            complaint_id = complaint["id"]
            
            # Mark as breached
            execute_query(
                "UPDATE complaints SET sla_breached = TRUE, updated_at = NOW() WHERE id = %s",
                (complaint_id,),
                fetch=False
            )
            
            # Record event
            create_sla_event(
                complaint_id=complaint_id,
                event_type="breached",
                event_data={
                    "sla_deadline": str(complaint["sla_deadline"]),
                    "priority": complaint["priority"],
                    "detected_at": str(now),
                    "auto_detected": True,
                },
            )
            
            breached_ids.append(complaint_id)
        
        if breached_ids:
            logger.warning(f"SLA auto-check: {len(breached_ids)} breaches detected: {breached_ids}")
        
        return {"breached_count": len(breached_ids), "breached_ids": breached_ids}
        
    except Exception as e:
        logger.error(f"SLA auto-check failed: {e}")
        return None
