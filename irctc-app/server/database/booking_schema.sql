-- ==============================================================================
-- IRCTC Railway Reservation System - Booking Domain Schema
-- PostgreSQL Physical Database Implementation
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables to recreate them with the new schema
DROP TABLE IF EXISTS passengers CASCADE;
DROP TABLE IF EXISTS pnrs CASCADE;

-- ==============================================================================
-- 1. Table: pnrs
-- ==============================================================================
CREATE TABLE IF NOT EXISTS pnrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pnr_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth_users(id),
    train_id UUID NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
    from_station_name VARCHAR(100) NOT NULL,
    to_station_name VARCHAR(100) NOT NULL,
    journey_date DATE,
    train_class_id VARCHAR(50),
    quota_id VARCHAR(50),
    total_fare DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'BOOKED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pnrs_pnr_number ON pnrs(pnr_number);
CREATE INDEX IF NOT EXISTS idx_pnrs_user_id ON pnrs(user_id);
CREATE INDEX IF NOT EXISTS idx_pnrs_train_id ON pnrs(train_id);
CREATE INDEX IF NOT EXISTS idx_pnrs_journey_date ON pnrs(journey_date);
CREATE INDEX IF NOT EXISTS idx_pnrs_status ON pnrs(status);

-- ==============================================================================
-- 2. Table: passengers
-- ==============================================================================
CREATE TABLE IF NOT EXISTS passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pnr_id UUID NOT NULL REFERENCES pnrs(id) ON DELETE CASCADE,
    passenger_index INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10),
    berth_preference_id VARCHAR(50),
    food_preference VARCHAR(50),
    current_status VARCHAR(50),
    current_seat_number VARCHAR(10),
    current_berth_type VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_passengers_pnr_id ON passengers(pnr_id);
CREATE INDEX IF NOT EXISTS idx_passengers_status ON passengers(current_status);
