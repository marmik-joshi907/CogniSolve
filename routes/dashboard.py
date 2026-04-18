"""
CogniSol - Dashboard Routes
API endpoints for dashboard statistics.
"""

from flask import Blueprint, jsonify
from db.connection import execute_query_one, execute_query

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/api/dashboard/stats", methods=["GET"])
def get_dashboard_stats():
    """
    Get dashboard statistics.
    
    Returns:
        200: {
            total_complaints: int,
            by_category: { Product: n, Packaging: n, Trade: n },
            by_priority: { high: n, medium: n, low: n },
            by_status: { open: n, in_progress: n, resolved: n, closed: n },
            by_channel: { call: n, email: n, web: n },
            sla_breached: int
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

        return jsonify({
            "success": True,
            "data": {
                "total_complaints": total_count,
                "by_category": by_category,
                "by_priority": by_priority,
                "by_status": by_status,
                "by_channel": by_channel,
                "sla_breached": sla_breached,
            },
        }), 200

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
