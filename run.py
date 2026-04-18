"""
CogniSol - Application Entry Point
Flask application factory with blueprint registration and schema initialization.
"""

import os
import sys
from flask import Flask, jsonify
from config.settings import Config
from db.connection import init_pool, execute_script, close_pool
from routes.complaints import complaints_bp
from routes.dashboard import dashboard_bp


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config["SECRET_KEY"] = Config.APP_SECRET_KEY

    # Register blueprints
    app.register_blueprint(complaints_bp)
    app.register_blueprint(dashboard_bp)

    # Health check endpoint
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "CogniSol Complaint Classification System",
            "version": "1.0.0-phase1",
        }), 200

    # Initialize database on startup
    with app.app_context():
        _init_database()

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
