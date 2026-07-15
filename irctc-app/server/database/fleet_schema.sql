-- ==============================================================================
-- IRCTC Railway Reservation System - Fleet Domain Schema
-- PostgreSQL Physical Database Implementation
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Table: trains
-- ==============================================================================
CREATE TABLE IF NOT EXISTS trains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    train_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    operator_id UUID,
    category_id UUID,
    type_id UUID,
    return_train_id UUID REFERENCES trains(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance based on allowed sorts and searchable columns
CREATE INDEX IF NOT EXISTS idx_trains_number ON trains(train_number);
CREATE INDEX IF NOT EXISTS idx_trains_name ON trains(name);
CREATE INDEX IF NOT EXISTS idx_trains_status ON trains(status);
CREATE INDEX IF NOT EXISTS idx_trains_created_at ON trains(created_at);

-- ==============================================================================
-- 2. Table: coaches
-- ==============================================================================
CREATE TABLE IF NOT EXISTS coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    coach_type_id UUID,
    layout_id UUID,
    manufacturing_date DATE,
    status VARCHAR(50) DEFAULT 'IN_SERVICE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance based on allowed sorts and searchable columns
CREATE INDEX IF NOT EXISTS idx_coaches_serial ON coaches(serial_number);
CREATE INDEX IF NOT EXISTS idx_coaches_status ON coaches(status);
CREATE INDEX IF NOT EXISTS idx_coaches_created_at ON coaches(created_at);

-- ==============================================================================
-- 3. Table: train_schedules
-- ==============================================================================
CREATE TABLE IF NOT EXISTS train_schedules (
    train_id UUID NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    halt_order INTEGER NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    day_count INTEGER DEFAULT 1,
    distance_from_origin DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (train_id, station_id)
);

-- Indexes for performance based on allowed sorts and searchable columns
CREATE INDEX IF NOT EXISTS idx_schedules_train ON train_schedules(train_id);
CREATE INDEX IF NOT EXISTS idx_schedules_station ON train_schedules(station_id);
CREATE INDEX IF NOT EXISTS idx_schedules_halt_order ON train_schedules(halt_order);
CREATE INDEX IF NOT EXISTS idx_schedules_arrival ON train_schedules(arrival_time);
CREATE INDEX IF NOT EXISTS idx_schedules_distance ON train_schedules(distance_from_origin);
