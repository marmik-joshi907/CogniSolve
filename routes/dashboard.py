"""
CogniSol - Dashboard Routes
API endpoints for dashboard statistics, analytics, and SLA breach detection.
"""

from flask import Blueprint, jsonify, request
from db.connection import execute_query_one, execute_query

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/api/dashboard/stats", methods=["GET"])
def get_dashboard_stats():
    """
    Get comprehensive dashboard statistics.
    
    Returns:
        200: {
            total_complaints, by_category, by_priority, by_status,
            by_channel, sla_breached, avg_confidence,
            recent_complaints, resolution_stats
        }
    """
    try:
        # Total complaints
        total = execute_query_one("SELECT COUNT(*) as count FROM complaints")
        total_count = total["count"] if total else 0

        # Count by category
        category_rows = execute_query(
            "SELECT category, COUNT(*) as count FROM complaints GROUP BY category ORDER BY category"
        )
        by_category = {row["category"]: row["count"] for row in category_rows}

        # Count by priority
        priority_rows = execute_query(
            "SELECT priority, COUNT(*) as count FROM complaints GROUP BY priority ORDER BY priority"
        )
        by_priority = {row["priority"]: row["count"] for row in priority_rows}

        # Count by status
        status_rows = execute_query(
            "SELECT status, COUNT(*) as count FROM complaints GROUP BY status ORDER BY status"
        )
        by_status = {row["status"]: row["count"] for row in status_rows}

        # Count by channel
        channel_rows = execute_query(
            "SELECT channel, COUNT(*) as count FROM complaints GROUP BY channel ORDER BY channel"
        )
        by_channel = {row["channel"]: row["count"] for row in channel_rows}

        # SLA breached count
        breached = execute_query_one(
            "SELECT COUNT(*) as count FROM complaints WHERE sla_breached = TRUE"
        )
        sla_breached = breached["count"] if breached else 0

        # Average confidence score
        avg_conf = execute_query_one(
            "SELECT AVG(confidence_score) as avg_conf FROM complaints WHERE confidence_score IS NOT NULL"
        )
        avg_confidence = round(float(avg_conf["avg_conf"]), 3) if avg_conf and avg_conf["avg_conf"] else 0

        # Complaints with resolution text
        resolved_count = execute_query_one(
            "SELECT COUNT(*) as count FROM complaints WHERE resolution_text IS NOT NULL AND resolution_text != ''"
        )
        has_resolution = resolved_count["count"] if resolved_count else 0

        # Recent complaints (last 10) — with SLA remaining
        recent = execute_query("""
            SELECT id, complaint_text, channel, status, category, priority,
                   confidence_score, sla_deadline, sla_breached, created_at
            FROM complaints
            ORDER BY created_at DESC
            LIMIT 10
        """)
        # Serialize datetime and add SLA remaining
        from datetime import datetime
        for r in recent:
            for k, v in r.items():
                if isinstance(v, datetime):
                    r[k] = v.isoformat()
                elif hasattr(v, '__float__'):
                    r[k] = float(v)
            # Add SLA remaining computation
            if r.get("sla_deadline"):
                try:
                    deadline = datetime.fromisoformat(r["sla_deadline"]) if isinstance(r["sla_deadline"], str) else r["sla_deadline"]
                    now = datetime.now()
                    remaining = (deadline - now).total_seconds()
                    r["sla_remaining"] = {
                        "hours": max(0, int(remaining // 3600)),
                        "minutes": max(0, int((remaining % 3600) // 60)),
                        "total_seconds": max(0, int(remaining)),
                        "breached": remaining <= 0 or r.get("sla_breached", False),
                    }
                except Exception:
                    r["sla_remaining"] = None

        # Average resolution time (hours) for resolved/closed complaints
        avg_res = execute_query_one("""
            SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as avg_hours
            FROM complaints
            WHERE status IN ('resolved', 'closed') AND updated_at > created_at
        """)
        avg_resolution_hours = round(float(avg_res["avg_hours"]), 1) if avg_res and avg_res["avg_hours"] else 0

        return jsonify({
            "success": True,
            "data": {
                "total_complaints": total_count,
                "by_category": by_category,
                "by_priority": by_priority,
                "by_status": by_status,
                "by_channel": by_channel,
                "sla_breached": sla_breached,
                "avg_confidence": avg_confidence,
                "avg_resolution_hours": avg_resolution_hours,
                "has_resolution": has_resolution,
                "recent_complaints": recent,
            },
        }), 200

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@dashboard_bp.route("/api/dashboard/sla-check", methods=["POST"])
def check_sla_breaches():
    """
    Actively detect and mark SLA breaches.
    
    Scans all open/in_progress complaints where sla_deadline has passed
    and marks them as breached. Also creates SLA breach events.
    
    Returns:
        200: { breached_count, breached_ids }
    """
    try:
        # Find complaints that have exceeded their SLA deadline
        overdue = execute_query("""
            SELECT id, priority, sla_deadline
            FROM complaints
            WHERE sla_breached = FALSE
              AND sla_deadline IS NOT NULL
              AND sla_deadline < NOW()
              AND status NOT IN ('resolved', 'closed')
        """)
        
        breached_ids = []
        
        for complaint in overdue:
            complaint_id = complaint["id"]
            
            # Mark as breached in database
            execute_query(
                "UPDATE complaints SET sla_breached = TRUE, updated_at = NOW() WHERE id = %s",
                (complaint_id,),
                fetch=False
            )
            
            # Record SLA breach event
            from models.sla import create_sla_event
            create_sla_event(
                complaint_id=complaint_id,
                event_type="breached",
                event_data={
                    "sla_deadline": str(complaint["sla_deadline"]),
                    "priority": complaint["priority"],
                    "detected_at": str(__import__('datetime').datetime.now()),
                },
            )
            
            breached_ids.append(complaint_id)
        
        return jsonify({
            "success": True,
            "message": f"SLA check complete. {len(breached_ids)} new breaches detected.",
            "data": {
                "breached_count": len(breached_ids),
                "breached_ids": breached_ids,
            },
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"SLA check failed: {str(e)}"}), 500


@dashboard_bp.route("/api/dashboard/sla-summary", methods=["GET"])
def get_sla_summary():
    """
    Get SLA summary with countdown data for active complaints.
    
    Returns:
        200: List of active complaints with SLA remaining time
    """
    try:
        from datetime import datetime
        
        active = execute_query("""
            SELECT id, category, priority, status, sla_deadline, sla_breached, created_at
            FROM complaints
            WHERE status IN ('open', 'in_progress')
            ORDER BY sla_deadline ASC
        """)
        
        now = datetime.now()
        sla_data = []
        
        for comp in active:
            deadline = comp["sla_deadline"]
            if deadline:
                remaining = (deadline - now).total_seconds()
                sla_data.append({
                    "id": comp["id"],
                    "category": comp["category"],
                    "priority": comp["priority"],
                    "status": comp["status"],
                    "sla_deadline": deadline.isoformat(),
                    "sla_breached": comp["sla_breached"] or remaining <= 0,
                    "remaining_hours": max(0, round(remaining / 3600, 1)),
                    "remaining_minutes": max(0, int(remaining // 60)),
                    "urgency": "critical" if remaining < 3600 else "warning" if remaining < 7200 else "normal",
                })
        
        # Counts
        total_active = len(sla_data)
        critical = sum(1 for s in sla_data if s["urgency"] == "critical")
        warning = sum(1 for s in sla_data if s["urgency"] == "warning")
        breached = sum(1 for s in sla_data if s["sla_breached"])
        
        return jsonify({
            "success": True,
            "data": {
                "total_active": total_active,
                "critical_count": critical,
                "warning_count": warning,
                "breached_count": breached,
                "complaints": sla_data,
            },
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"SLA summary failed: {str(e)}"}), 500
