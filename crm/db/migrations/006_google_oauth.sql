-- ============================================================
-- Migration 006 — Google OAuth Support
-- Run this in the Supabase SQL Editor.
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
  ALTER COLUMN password_hash DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_email ON organizations(email);
CREATE INDEX IF NOT EXISTS idx_organizations_google_id ON organizations(google_id);
