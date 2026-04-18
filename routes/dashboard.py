"""
CogniSol - Dashboard Routes
API endpoints for dashboard statistics and analytics.
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

        # Recent complaints (last 10)
        recent = execute_query("""
            SELECT id, complaint_text, channel, status, category, priority,
                   confidence_score, sla_breached, created_at
            FROM complaints
            ORDER BY created_at DESC
            LIMIT 10
        """)
        # Serialize datetime
        from datetime import datetime
        for r in recent:
            for k, v in r.items():
                if isinstance(v, datetime):
                    r[k] = v.isoformat()
                elif hasattr(v, '__float__'):
                    r[k] = float(v)

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
