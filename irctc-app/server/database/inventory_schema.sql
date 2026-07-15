-- ==============================================================================
-- IRCTC Railway Reservation System - Inventory Domain Schema
-- PostgreSQL Physical Database Implementation
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ==============================================================================
-- 1. Table: train_run
-- ==============================================================================
CREATE TABLE IF NOT EXISTS train_run (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    train_id UUID, -- References trains(id) if fleet schema is present
    travel_date DATE,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    inventory_version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_train_run_train_id ON train_run(train_id);
CREATE INDEX IF NOT EXISTS idx_train_run_travel_date ON train_run(travel_date);
CREATE INDEX IF NOT EXISTS idx_train_run_status ON train_run(status);

-- ==============================================================================
-- 2. Table: coach_inventory
-- ==============================================================================
CREATE TABLE IF NOT EXISTS coach_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    train_run_id UUID NOT NULL REFERENCES train_run(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL, -- References coaches(id)
    class_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coach_inv_train_run ON coach_inventory(train_run_id);
CREATE INDEX IF NOT EXISTS idx_coach_inv_coach ON coach_inventory(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_inv_class ON coach_inventory(class_id);
-- Composite index for SeatRepository query
CREATE INDEX IF NOT EXISTS idx_coach_inv_run_class ON coach_inventory(train_run_id, class_id);

-- ==============================================================================
-- 3. Table: seat_inventory
-- ==============================================================================
CREATE TABLE IF NOT EXISTS seat_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_inventory_id UUID NOT NULL REFERENCES coach_inventory(id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seat_inv_coach ON seat_inventory(coach_inventory_id);
CREATE INDEX IF NOT EXISTS idx_seat_inv_number ON seat_inventory(seat_number);

-- ==============================================================================
-- 4. Table: seat_allocation
-- ==============================================================================
CREATE TABLE IF NOT EXISTS seat_allocation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    train_run_id UUID NOT NULL REFERENCES train_run(id) ON DELETE CASCADE,
    seat_inventory_id UUID NOT NULL REFERENCES seat_inventory(id) ON DELETE CASCADE,
    passenger_id UUID,
    pnr_number VARCHAR(50),
    start_segment_seq INTEGER NOT NULL,
    end_segment_seq INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'ALLOCATED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Exclusion constraint to prevent double booking of the same seat for overlapping segments
    CONSTRAINT no_overlapping_allocations EXCLUDE USING GIST (
        seat_inventory_id WITH =,
        int4range(start_segment_seq, end_segment_seq) WITH &&
    )
);

CREATE INDEX IF NOT EXISTS idx_seat_alloc_train_run ON seat_allocation(train_run_id);
CREATE INDEX IF NOT EXISTS idx_seat_alloc_seat_inv ON seat_allocation(seat_inventory_id);
CREATE INDEX IF NOT EXISTS idx_seat_alloc_status ON seat_allocation(status);

-- ==============================================================================
-- 5. Table: seat_lock
-- ==============================================================================
CREATE TABLE IF NOT EXISTS seat_lock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seat_inventory_id UUID NOT NULL REFERENCES seat_inventory(id) ON DELETE CASCADE,
    start_segment_seq INTEGER NOT NULL,
    end_segment_seq INTEGER NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seat_lock_seat_inv ON seat_lock(seat_inventory_id);
CREATE INDEX IF NOT EXISTS idx_seat_lock_expires ON seat_lock(expires_at);
