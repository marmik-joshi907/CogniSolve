"""
CogniSol Configuration
Loads all settings from environment variables via .env file.
"""

import os
from dotenv import load_dotenv

# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))


class Config:
    """Application configuration loaded from environment variables."""

    # PostgreSQL
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", 5432))
    DB_NAME = os.getenv("DB_NAME", "cognisol")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

    # Redis
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_DB = int(os.getenv("REDIS_DB", 0))

    # Application
    APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT = int(os.getenv("APP_PORT", 5000))
    APP_DEBUG = os.getenv("APP_DEBUG", "false").lower() == "true"
    APP_SECRET_KEY = os.getenv("APP_SECRET_KEY", "change-this-in-production")

    # SLA Deadlines (hours)
    SLA_HIGH_HOURS = int(os.getenv("SLA_HIGH_HOURS", 4))
    SLA_MEDIUM_HOURS = int(os.getenv("SLA_MEDIUM_HOURS", 12))
    SLA_LOW_HOURS = int(os.getenv("SLA_LOW_HOURS", 24))

    @classmethod
    def get_db_dsn(cls):
        """Return PostgreSQL connection string."""
        return (
            f"host={cls.DB_HOST} "
            f"port={cls.DB_PORT} "
            f"dbname={cls.DB_NAME} "
            f"user={cls.DB_USER} "
            f"password={cls.DB_PASSWORD}"
        )

    @classmethod
    def get_redis_url(cls):
        """Return Redis connection URL."""
        return f"redis://{cls.REDIS_HOST}:{cls.REDIS_PORT}/{cls.REDIS_DB}"
