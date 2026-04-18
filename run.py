"""
CogniSol - Application Entry Point
Flask application factory with blueprint registration, ML model loading,
and schema initialization.
"""

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from config.settings import Config
from db.connection import init_pool, execute_script, close_pool
from routes.complaints import complaints_bp
from routes.dashboard import dashboard_bp
from routes.export import export_bp


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config["SECRET_KEY"] = Config.APP_SECRET_KEY
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(complaints_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(export_bp)

    # Health check endpoint
    @app.route("/api/health", methods=["GET"])
    def health_check():
        from services.classifier import _models_loaded
        from services.resolution_engine import check_ollama_status
        
        ollama = check_ollama_status()
        
        return jsonify({
            "status": "healthy",
            "service": "CogniSol Complaint Classification System",
            "version": "2.0.0",
            "ml_models_loaded": _models_loaded,
            "classification_method": "ml" if _models_loaded else "rule_based",
            "resolution_engine": "ollama" if ollama["available"] else "template",
            "ollama_status": ollama,
        }), 200

    # Root endpoint
    @app.route("/", methods=["GET"])
    @app.route("/api", methods=["GET"])
    @app.route("/api/", methods=["GET"])
    def index():
        return jsonify({
            "status": "online",
            "message": "CogniSol Backend API v2.0 — ML Pipeline Active",
            "endpoints": [
                "/api/health",
                "/api/complaints",
                "/api/complaints/submit",
                "/api/complaints/<id>/status",
                "/api/dashboard/stats",
                "/api/export/csv",
                "/api/export/pdf",
            ]
        }), 200

    # Initialize database and ML models on startup
    with app.app_context():
        _init_database()
        _init_ml_models()

    return app


def _init_database():
    """Initialize connection pool and run schema migration."""
    try:
        print("[CogniSol] Initializing database connection pool...")
        init_pool()

        # Run schema.sql to create/update tables
        schema_path = os.path.join(os.path.dirname(__file__), "db", "schema.sql")
        if os.path.exists(schema_path):
            with open(schema_path, "r") as f:
                schema_sql = f.read()
            execute_script(schema_sql)
            print("[CogniSol] Database schema initialized successfully.")
        else:
            print("[CogniSol] WARNING: schema.sql not found, skipping schema init.")

    except Exception as e:
        print(f"[CogniSol] ERROR: Failed to initialize database: {e}")
        print("[CogniSol] Make sure PostgreSQL is running and .env is configured correctly.")
        sys.exit(1)


def _init_ml_models():
    """Load trained ML models at startup."""
    try:
        from services.classifier import load_models
        loaded = load_models()
        if loaded:
            print("[CogniSol] ML classification pipeline: ACTIVE")
        else:
            print("[CogniSol] ML classification pipeline: FALLBACK (rule-based)")
            print("[CogniSol] Run 'python -m services.train_model' to train ML models.")
    except Exception as e:
        print(f"[CogniSol] WARNING: Could not load ML models: {e}")

    # Check Ollama
    try:
        from services.resolution_engine import check_ollama_status
        ollama = check_ollama_status()
        if ollama["available"]:
            print(f"[CogniSol] Resolution engine: OLLAMA ({ollama['active_model']})")
        else:
            print("[CogniSol] Resolution engine: TEMPLATE (Ollama not running)")
    except Exception:
        print("[CogniSol] Resolution engine: TEMPLATE")


if __name__ == "__main__":
    app = create_app()
    print(f"[CogniSol] Starting server on {Config.APP_HOST}:{Config.APP_PORT}")
    print(f"[CogniSol] Debug mode: {Config.APP_DEBUG}")
    print(f"[CogniSol] API Base URL: http://localhost:{Config.APP_PORT}/api")
    app.run(
        host=Config.APP_HOST,
        port=Config.APP_PORT,
        debug=Config.APP_DEBUG,
    )
