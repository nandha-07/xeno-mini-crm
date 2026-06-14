-- ============================================================
-- Migration 007 — Support Tickets
-- Run this in the Supabase SQL Editor.
-- Safe to run more than once (idempotent).
-- ============================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_type     TEXT NOT NULL CHECK (ticket_type IN ('bug', 'feature_request', 'billing', 'question', 'other')),
  impact_level    TEXT NOT NULL CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  duration        TEXT NOT NULL,
  description     TEXT NOT NULL,
  point_of_contact TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_org_id ON support_tickets(org_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- Optional: Function to auto-update updated_at timestamp if you have a trigger system
-- Otherwise it can be updated by the backend manually.
