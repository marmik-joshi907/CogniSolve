"""
CogniSol - Complaint Routes
API endpoints for complaint submission, listing, and status updates.
Uses real ML classifier + Ollama resolution engine.
"""

from flask import Blueprint, request, jsonify
from models.complaint import (
    create_complaint,
    get_all_complaints,
    get_complaint_by_id,
    update_complaint_status,
)
from models.sla import create_sla_event
from services.classifier import classify_complaint
from services.resolution_engine import generate_resolution

complaints_bp = Blueprint("complaints", __name__)

# Valid values
VALID_CHANNELS = {"call", "email", "web"}
VALID_STATUSES = {"open", "in_progress", "resolved", "closed"}


@complaints_bp.route("/api/complaints/submit", methods=["POST"])
def submit_complaint():
    """
    Submit a new complaint for classification and resolution.
    
    Request Body:
        {
            "text": "complaint description",
            "channel": "call" | "email" | "web"
        }
    
    Returns:
        201: Created complaint with ML classification + resolution recommendation
        400: Validation error
        500: Server error
    """
    try:
        data = request.get_json()

        # Validate input
        if not data:
            return jsonify({"error": "Request body is required"}), 400

        text = data.get("text", "").strip()
        channel = data.get("channel", "").strip().lower()

        if not text:
            return jsonify({"error": "Field 'text' is required and cannot be empty"}), 400

        if channel not in VALID_CHANNELS:
            return jsonify({
                "error": f"Field 'channel' must be one of: {', '.join(VALID_CHANNELS)}"
            }), 400

        # ── Layer 4: Classify complaint (ML or rule-based) ──
        classification = classify_complaint(text, channel)

        # ── Layer 5: Generate resolution recommendation (Ollama or template) ──
        resolution = generate_resolution(
            complaint_text=text,
            category=classification["category"],
            priority=classification["priority"],
        )

        # ── Layer 6: Store in database ──
        complaint = create_complaint(
            complaint_text=text,
            channel=channel,
            category=classification["category"],
            priority=classification["priority"],
            confidence_score=classification["confidence"],
            sla_deadline=classification["sla_deadline"],
            resolution_text=resolution["resolution_text"],
        )

        # Record SLA creation event
        create_sla_event(
            complaint_id=complaint["id"],
            event_type="created",
            event_data={
                "category": classification["category"],
                "priority": classification["priority"],
                "confidence": classification["confidence"],
                "urgency_score": classification.get("urgency_score", 0),
                "classification_method": classification.get("classification_method", "unknown"),
                "resolution_method": resolution.get("method", "unknown"),
                "sla_hours": {
                    "high": 4, "medium": 12, "low": 24
                }[classification["priority"]],
            },
        )

        return jsonify({
            "success": True,
            "message": "Complaint submitted and classified successfully",
            "data": complaint,
            "classification": {
                "method": classification.get("classification_method", "unknown"),
                "urgency_score": classification.get("urgency_score", 0),
            },
            "resolution": {
                "method": resolution.get("method", "unknown"),
            },
        }), 201

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@complaints_bp.route("/api/complaints", methods=["GET"])
def list_complaints():
    """
    List all complaints with optional filters.
    
    Query Parameters:
        category: Product | Packaging | Trade
        priority: high | medium | low
        status:   open | in_progress | resolved | closed
        channel:  call | email | web
    
    Returns:
        200: List of complaints
    """
    try:
        filters = {
            "category": request.args.get("category"),
            "priority": request.args.get("priority"),
            "status": request.args.get("status"),
            "channel": request.args.get("channel"),
        }

        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}

        complaints = get_all_complaints(filters if filters else None)

        return jsonify({
            "success": True,
            "count": len(complaints),
            "data": complaints,
        }), 200

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@complaints_bp.route("/api/complaints/<int:complaint_id>", methods=["GET"])
def get_complaint(complaint_id):
    """Get a single complaint by ID."""
    try:
        complaint = get_complaint_by_id(complaint_id)
        if not complaint:
            return jsonify({"error": f"Complaint {complaint_id} not found"}), 404
        
        return jsonify({
            "success": True,
            "data": complaint,
        }), 200
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@complaints_bp.route("/api/complaints/<int:complaint_id>/status", methods=["PATCH"])
def patch_complaint_status(complaint_id):
    """
    Update the status of a complaint.
    
    Request Body:
        {
            "status": "open" | "in_progress" | "resolved" | "closed"
        }
    
    Returns:
        200: Updated complaint
        400: Validation error
        404: Complaint not found
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body is required"}), 400

        new_status = data.get("status", "").strip().lower()

        if new_status not in VALID_STATUSES:
            return jsonify({
                "error": f"Field 'status' must be one of: {', '.join(VALID_STATUSES)}"
            }), 400

        # Check if complaint exists
        existing = get_complaint_by_id(complaint_id)
        if not existing:
            return jsonify({"error": f"Complaint with id {complaint_id} not found"}), 404

        # Update status
        updated = update_complaint_status(complaint_id, new_status)

        # Record SLA event
        event_type = new_status if new_status in ("resolved", "closed") else "assigned"
        create_sla_event(
            complaint_id=complaint_id,
            event_type=event_type,
            event_data={
                "previous_status": existing["status"],
                "new_status": new_status,
            },
        )

        return jsonify({
            "success": True,
            "message": f"Complaint status updated to '{new_status}'",
            "data": updated,
        }), 200

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
