"""
CogniSol Database Connection
Manages PostgreSQL connection pool using psycopg2.
"""

import psycopg2
from psycopg2 import pool, extras
from config.settings import Config

_connection_pool = None


def init_pool(min_conn=2, max_conn=10):
    """Initialize the connection pool. Call once at app startup."""
    global _connection_pool
    if _connection_pool is None:
        _connection_pool = pool.ThreadedConnectionPool(
            min_conn,
            max_conn,
            dsn=Config.get_db_dsn()
        )
    return _connection_pool


def get_connection():
    """Get a connection from the pool."""
    global _connection_pool
    if _connection_pool is None:
        init_pool()
    return _connection_pool.getconn()


def release_connection(conn):
    """Return a connection to the pool."""
    global _connection_pool
    if _connection_pool and conn:
        _connection_pool.putconn(conn)


def close_pool():
    """Close all connections in the pool."""
    global _connection_pool
    if _connection_pool:
        _connection_pool.closeall()
        _connection_pool = None


def execute_query(query, params=None, fetch=True):
    """
    Execute a SQL query and return results.
    
    Args:
        query: SQL query string
        params: Query parameters (tuple or dict)
        fetch: If True, fetch and return results as list of dicts
    
    Returns:
        List of dicts if fetch=True, else row count affected
    """
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute(query, params)
            if fetch:
                results = cur.fetchall()
                conn.commit()
                return [dict(row) for row in results]
            else:
                conn.commit()
                return cur.rowcount
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        release_connection(conn)


def execute_query_one(query, params=None):
    """Execute a query and return a single result as dict."""
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute(query, params)
            result = cur.fetchone()
            conn.commit()
            return dict(result) if result else None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        release_connection(conn)


def execute_script(script):
    """Execute a raw SQL script (e.g., schema creation)."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(script)
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        release_connection(conn)
