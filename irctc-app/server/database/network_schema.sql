-- ==============================================================================
-- IRCTC Railway Reservation System - Network Domain Schema
-- PostgreSQL Physical Database Implementation
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Table: stations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    city_id UUID, -- Optional foreign key to cities if exists
    division_id UUID, -- Optional foreign key to divisions if exists
    category_id UUID, -- Optional foreign key to categories if exists
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    elevation_meters INTEGER DEFAULT 0,
    number_of_platforms INTEGER DEFAULT 1,
    is_junction BOOLEAN DEFAULT FALSE,
    is_terminal BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'OPERATIONAL',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance based on allowed sorts and searchable columns
CREATE INDEX IF NOT EXISTS idx_stations_code ON stations(code);
CREATE INDEX IF NOT EXISTS idx_stations_name ON stations(name);
CREATE INDEX IF NOT EXISTS idx_stations_status ON stations(status);
CREATE INDEX IF NOT EXISTS idx_stations_created_at ON stations(created_at);

-- ==============================================================================
-- 2. Table: routes
-- ==============================================================================
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    origin_station_id UUID NOT NULL REFERENCES stations(id),
    destination_station_id UUID NOT NULL REFERENCES stations(id),
    total_distance_km DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance based on allowed sorts and searchable columns
CREATE INDEX IF NOT EXISTS idx_routes_code ON routes(code);
CREATE INDEX IF NOT EXISTS idx_routes_origin ON routes(origin_station_id);
CREATE INDEX IF NOT EXISTS idx_routes_destination ON routes(destination_station_id);
CREATE INDEX IF NOT EXISTS idx_routes_distance ON routes(total_distance_km);
CREATE INDEX IF NOT EXISTS idx_routes_created_at ON routes(created_at);
