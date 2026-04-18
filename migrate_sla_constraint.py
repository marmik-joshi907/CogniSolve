"""
CogniSolve - Schema Migration: Add qa_approved to sla_events event_type CHECK constraint.
Non-destructive: only widens the allowed values, existing data is unaffected.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db.connection import init_pool, execute_script

def migrate():
    print("[Migration] Initializing database connection...")
    init_pool()
    
    migration_sql = """
    -- Drop existing constraint
    ALTER TABLE sla_events DROP CONSTRAINT IF EXISTS sla_events_event_type_check;
    
    -- Add updated constraint with qa_approved
    ALTER TABLE sla_events ADD CONSTRAINT sla_events_event_type_check
        CHECK (event_type IN ('created', 'assigned', 'escalated', 'breached', 'resolved', 'closed', 'qa_approved'));
    """
    
    print("[Migration] Applying: Add 'qa_approved' to sla_events.event_type CHECK constraint...")
    execute_script(migration_sql)
    print("[Migration] ✓ Schema migration completed successfully.")

if __name__ == "__main__":
    migrate()
