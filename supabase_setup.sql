-- ============================================================
-- Smart Vehicle & Driver QR Verification System
-- Supabase SQL Setup Script
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Table: vehicles ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vehicles (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_number     TEXT NOT NULL,
  owner_name              TEXT NOT NULL,
  owner_aadhaar_encrypted TEXT NOT NULL,
  owner_mobile            TEXT,
  chassis_number          TEXT,
  registration_date       DATE,
  driver_name             TEXT,
  driver_aadhaar_encrypted TEXT,
  driver_mobile           TEXT,
  driving_license_number  TEXT,
  status                  TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast search
CREATE INDEX IF NOT EXISTS idx_vehicles_registration_number ON vehicles (registration_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles (status);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles (created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Table: audit_logs ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action       TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'VIEW')),
  vehicle_id   UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  performed_by TEXT,
  details      TEXT,
  ip_address   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_vehicle_id ON audit_logs (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on both tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ─── vehicles policies ───────────────────────────────────────────────────────

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Service role has full access to vehicles" ON vehicles;
DROP POLICY IF EXISTS "Authenticated users can read vehicles" ON vehicles;

-- Service role (backend) has full access
CREATE POLICY "Service role has full access to vehicles"
  ON vehicles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users (admin frontend) can read
-- Note: All writes go through backend with service_role key
CREATE POLICY "Authenticated users can read vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (true);

-- ─── audit_logs policies ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service role has full access to audit_logs" ON audit_logs;

CREATE POLICY "Service role has full access to audit_logs"
  ON audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Check tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('vehicles', 'audit_logs');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('vehicles', 'audit_logs');
