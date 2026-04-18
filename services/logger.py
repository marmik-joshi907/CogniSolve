"""
CogniSol - Structured Logging Module
Provides a centralized, configurable logging system.
New module — does NOT modify any existing code.
"""

import logging
import os
import sys
from datetime import datetime


def get_logger(name="cognisol"):
    """
    Get a configured logger instance.
    
    Args:
        name: Logger name (typically module name)
    
    Returns:
        logging.Logger instance
    """
    logger = logging.getLogger(name)
    
    # Avoid adding duplicate handlers
    if logger.handlers:
        return logger
    
    logger.setLevel(logging.DEBUG)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_format = logging.Formatter(
        "[CogniSol] %(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)
    
    # File handler (optional — only if logs directory exists)
    logs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")
    if os.path.exists(logs_dir):
        file_handler = logging.FileHandler(
            os.path.join(logs_dir, f"cognisol_{datetime.now().strftime('%Y%m%d')}.log"),
            encoding="utf-8"
        )
        file_handler.setLevel(logging.DEBUG)
        file_format = logging.Formatter(
            "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        file_handler.setFormatter(file_format)
        logger.addHandler(file_handler)
    
    return logger
