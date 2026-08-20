/*
# PTaaS Platform — Initial Schema

## Overview
Creates the full data model for a Penetration Testing as a Service platform:
clients/projects, authorized scopes (consent gate), scan runs, scenario
results, evidence files, and an immutable scan execution audit log.

## Tables

### projects
A penetration-testing engagement for a client. Contains the client name,
base target domain, and engagement metadata.

### authorized_scopes
The consent gate. Every target URL/host that the platform is allowed to
scan MUST have a matching row here with `status = 'approved'`. The
orchestrator rejects any scan whose target is not in an approved scope.
Each scope belongs to a project.

### scan_runs
A single scan execution against a target URL within an approved scope.
Tracks overall status (queued/running/completed/failed), started/ended
timestamps, and aggregate counts of scenario outcomes.

### scenario_results
The result of one of the 101 defined scenarios within a scan run.
Stores status (pass/fail/vulnerable/manual_review/pending), severity,
CVSS score, evidence text, and remediation advice.

### evidence
Structured evidence attached to a scenario result (request/response
pairs, screenshot URLs, raw logs). Linked to scenario_results.

### scan_logs
Immutable audit trail of who initiated a scan, when, and against what
target — for accountability and compliance (FATA / central-bank logging).

## Security
- RLS enabled on every table.
- This is a single-tenant demo platform (no sign-in screen), so policies
  use TO anon, authenticated with USING (true) — the data is intentionally
  shared within the platform instance.
- In a multi-tenant deployment these would be scoped by user_id / tenant_id.
*/

-- ===== projects =====
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  target_domain text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','paused','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE TO anon, authenticated USING (true);

-- ===== authorized_scopes =====
CREATE TABLE IF NOT EXISTS authorized_scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  host_pattern text NOT NULL,
  scope_type text NOT NULL DEFAULT 'domain'
    CHECK (scope_type IN ('domain','subdomain','ip','url','wildcard')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','revoked')),
  authorized_by text,
  authorized_at timestamptz,
  consent_document text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE authorized_scopes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_scopes" ON authorized_scopes;
CREATE POLICY "anon_select_scopes" ON authorized_scopes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_scopes" ON authorized_scopes;
CREATE POLICY "anon_insert_scopes" ON authorized_scopes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_scopes" ON authorized_scopes;
CREATE POLICY "anon_update_scopes" ON authorized_scopes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_scopes" ON authorized_scopes;
CREATE POLICY "anon_delete_scopes" ON authorized_scopes FOR DELETE TO anon, authenticated USING (true);

-- ===== scan_runs =====
CREATE TABLE IF NOT EXISTS scan_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scope_id uuid NOT NULL REFERENCES authorized_scopes(id) ON DELETE CASCADE,
  target_url text NOT NULL,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','running','completed','failed','cancelled')),
  scan_profile text NOT NULL DEFAULT 'full'
    CHECK (scan_profile IN ('recon','passive','active','full','custom')),
  total_scenarios int NOT NULL DEFAULT 0,
  passed int NOT NULL DEFAULT 0,
  failed int NOT NULL DEFAULT 0,
  vulnerable int NOT NULL DEFAULT 0,
  manual_review int NOT NULL DEFAULT 0,
  pending int NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scan_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_scan_runs" ON scan_runs;
CREATE POLICY "anon_select_scan_runs" ON scan_runs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_scan_runs" ON scan_runs;
CREATE POLICY "anon_insert_scan_runs" ON scan_runs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_scan_runs" ON scan_runs;
CREATE POLICY "anon_update_scan_runs" ON scan_runs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_scan_runs" ON scan_runs;
CREATE POLICY "anon_delete_scan_runs" ON scan_runs FOR DELETE TO anon, authenticated USING (true);

-- ===== scenario_results =====
CREATE TABLE IF NOT EXISTS scenario_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_run_id uuid NOT NULL REFERENCES scan_runs(id) ON DELETE CASCADE,
  scenario_code text NOT NULL,
  scenario_title text NOT NULL,
  category text NOT NULL,
  execution_type text NOT NULL DEFAULT 'auto'
    CHECK (execution_type IN ('auto','semi-auto','manual')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','pass','fail','vulnerable','manual_review','skipped')),
  severity text NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info','low','medium','high','critical')),
  cvss_score numeric(3,1) NOT NULL DEFAULT 0.0,
  tool_used text,
  evidence_summary text,
  remediation text,
  request_data text,
  response_data text,
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scenario_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_scenario_results" ON scenario_results;
CREATE POLICY "anon_select_scenario_results" ON scenario_results FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_scenario_results" ON scenario_results;
CREATE POLICY "anon_insert_scenario_results" ON scenario_results FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_scenario_results" ON scenario_results;
CREATE POLICY "anon_update_scenario_results" ON scenario_results FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_scenario_results" ON scenario_results;
CREATE POLICY "anon_delete_scenario_results" ON scenario_results FOR DELETE TO anon, authenticated USING (true);

-- ===== evidence =====
CREATE TABLE IF NOT EXISTS evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_result_id uuid NOT NULL REFERENCES scenario_results(id) ON DELETE CASCADE,
  evidence_type text NOT NULL
    CHECK (evidence_type IN ('request','response','screenshot','log','raw')),
  title text NOT NULL,
  content text,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_evidence" ON evidence;
CREATE POLICY "anon_select_evidence" ON evidence FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_evidence" ON evidence;
CREATE POLICY "anon_insert_evidence" ON evidence FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_evidence" ON evidence;
CREATE POLICY "anon_delete_evidence" ON evidence FOR DELETE TO anon, authenticated USING (true);

-- ===== scan_logs (immutable audit trail) =====
CREATE TABLE IF NOT EXISTS scan_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_run_id uuid REFERENCES scan_runs(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  actor text NOT NULL,
  action text NOT NULL,
  target text,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_scan_logs" ON scan_logs;
CREATE POLICY "anon_select_scan_logs" ON scan_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_scan_logs" ON scan_logs;
CREATE POLICY "anon_insert_scan_logs" ON scan_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_authorized_scopes_project ON authorized_scopes(project_id);
CREATE INDEX IF NOT EXISTS idx_authorized_scopes_status ON authorized_scopes(status);
CREATE INDEX IF NOT EXISTS idx_scan_runs_project ON scan_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_scan_runs_status ON scan_runs(status);
CREATE INDEX IF NOT EXISTS idx_scenario_results_run ON scenario_results(scan_run_id);
CREATE INDEX IF NOT EXISTS idx_scenario_results_status ON scenario_results(status);
CREATE INDEX IF NOT EXISTS idx_scenario_results_severity ON scenario_results(severity);
CREATE INDEX IF NOT EXISTS idx_evidence_result ON evidence(scenario_result_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_run ON scan_logs(scan_run_id);