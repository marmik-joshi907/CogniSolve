-- ============================================
-- CogniSol - Database Schema
-- Phase 1: Core tables for complaint management
-- ============================================

-- Classification labels lookup table
CREATE TABLE IF NOT EXISTS classification_labels (
    id              SERIAL PRIMARY KEY,
    label_name      VARCHAR(50) UNIQUE NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Seed default classification labels
INSERT INTO classification_labels (label_name, description)
VALUES
    ('Product',   'Complaints related to product quality, defects, or effectiveness'),
    ('Packaging', 'Complaints related to packaging damage, labeling, or presentation'),
    ('Trade',     'Complaints related to trade practices, pricing, or distribution'),
    ('Other',     'Complaints that do not fit into the above categories')
ON CONFLICT (label_name) DO NOTHING;

-- Agents table (CSE, QA, Ops users)
CREATE TABLE IF NOT EXISTS agents (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    role            VARCHAR(30) NOT NULL CHECK (role IN ('cse', 'qa', 'ops', 'admin')),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Seed a default admin agent
INSERT INTO agents (name, email, role)
VALUES ('System Admin', 'admin@cognisol.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Main complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id                  SERIAL PRIMARY KEY,
    complaint_text      TEXT NOT NULL,
    channel             VARCHAR(20) NOT NULL CHECK (channel IN ('call', 'email', 'web')),
    status              VARCHAR(20) NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    
    -- Classification (mock for Phase 1, ML in Phase 2)
    category            VARCHAR(50) REFERENCES classification_labels(label_name),
    priority            VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')),
    confidence_score    DECIMAL(4,2),
    
    -- Resolution (LLM in Phase 3)
    resolution_text     TEXT,
    
    -- SLA
    sla_deadline        TIMESTAMP,
    sla_breached        BOOLEAN DEFAULT FALSE,
    
    -- Assignment
    assigned_agent_id   INTEGER REFERENCES agents(id),
    
    -- Timestamps
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- SLA events tracking table
CREATE TABLE IF NOT EXISTS sla_events (
    id              SERIAL PRIMARY KEY,
    complaint_id    INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    event_type      VARCHAR(30) NOT NULL
                        CHECK (event_type IN ('created', 'assigned', 'escalated', 'breached', 'resolved', 'closed')),
    event_data      JSONB DEFAULT '{}',
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_channel ON complaints(channel);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_sla_events_complaint_id ON sla_events(complaint_id);
