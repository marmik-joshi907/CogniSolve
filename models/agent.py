"""
CogniSol - Agent Model
CRUD operations for the agents table.
"""

from db.connection import execute_query, execute_query_one


def create_agent(name, email, role):
    """Create a new agent."""
    query = """
        INSERT INTO agents (name, email, role)
        VALUES (%s, %s, %s)
        RETURNING id, name, email, role, is_active, created_at, updated_at
    """
    return execute_query_one(query, (name, email, role))


def get_all_agents(active_only=True):
    """Retrieve all agents, optionally filtering by active status."""
    query = "SELECT id, name, email, role, is_active, created_at, updated_at FROM agents"
    if active_only:
        query += " WHERE is_active = TRUE"
    query += " ORDER BY name"
    return execute_query(query)


def get_agent_by_id(agent_id):
    """Retrieve a single agent by ID."""
    query = """
        SELECT id, name, email, role, is_active, created_at, updated_at
        FROM agents WHERE id = %s
    """
    return execute_query_one(query, (agent_id,))
