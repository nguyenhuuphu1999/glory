-- Initialize the database
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for status fields
DO $$ BEGIN
    CREATE TYPE location_status_enum AS ENUM ('actived', 'unactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE asset_status_enum AS ENUM ('actived', 'inactive', 'maintenance', 'retired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id INTEGER UNIQUE NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    organization VARCHAR(100) NOT NULL,
    status location_status_enum DEFAULT 'actived',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by_id UUID NULL,
    updated_by_id UUID NULL,
    deleted_by_id UUID NULL
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    serial VARCHAR(50) UNIQUE NOT NULL,
    status asset_status_enum DEFAULT 'actived',
    description TEXT NOT NULL,
    location_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by_id UUID NULL,
    updated_by_id UUID NULL,
    deleted_by_id UUID NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_locations_location_id ON locations(location_id);
CREATE INDEX IF NOT EXISTS idx_assets_serial ON assets(serial);
CREATE INDEX IF NOT EXISTS idx_assets_location_id ON assets(location_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);

-- Insert sample location data
INSERT INTO locations (location_id, location_name, organization, status) 
VALUES 
    (1, 'Main Office', 'Glory Corporation', 'actived'),
    (2, 'Warehouse A', 'Glory Corporation', 'actived'),
    (3, 'Branch Office', 'Glory Corporation', 'actived')
ON CONFLICT (location_id) DO NOTHING;

-- Insert sample asset data (using actual location UUIDs)
INSERT INTO assets (type, serial, status, description, location_id) 
SELECT 
    'CIA1-10',
    '0000001',
    'actived',
    'Sample asset description 1',
    l.id
FROM locations l WHERE l.location_id = 1
ON CONFLICT (serial) DO NOTHING;

INSERT INTO assets (type, serial, status, description, location_id) 
SELECT 
    'CIA1-10',
    '0000002',
    'actived',
    'Sample asset description 2',
    l.id
FROM locations l WHERE l.location_id = 1
ON CONFLICT (serial) DO NOTHING;

INSERT INTO assets (type, serial, status, description, location_id) 
SELECT 
    'CIA2-20',
    '0000003',
    'maintenance',
    'Sample asset description 3',
    l.id
FROM locations l WHERE l.location_id = 2
ON CONFLICT (serial) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 