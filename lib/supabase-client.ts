import { createClient } from '@supabase/supabase-js';
import { SCENARIOS, REMEDIATION_TEMPLATES } from './scenarios';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const isRealSupabase = Boolean(
  supabaseUrl &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 10
);

// Database types
export type Project = {
  id: string;
  client_name: string;
  target_domain: string;
  description: string | null;
  status: 'active' | 'paused' | 'archived';
  created_at: string;
  updated_at: string;
};

export type AuthorizedScope = {
  id: string;
  project_id: string;
  host_pattern: string;
  scope_type: 'domain' | 'subdomain' | 'ip' | 'url' | 'wildcard';
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  authorized_by: string | null;
  authorized_at: string | null;
  consent_document: string | null;
  notes: string | null;
  created_at: string;
};

export type ScanRun = {
  id: string;
  project_id: string;
  scope_id: string;
  target_url: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  scan_profile: 'recon' | 'passive' | 'active' | 'full' | 'custom';
  total_scenarios: number;
  passed: number;
  failed: number;
  vulnerable: number;
  manual_review: number;
  pending: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export type ScenarioResult = {
  id: string;
  scan_run_id: string;
  scenario_code: string;
  scenario_title: string;
  category: string;
  execution_type: 'auto' | 'semi-auto' | 'manual';
  status: 'pending' | 'pass' | 'fail' | 'vulnerable' | 'manual_review' | 'skipped';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  cvss_score: number;
  tool_used: string | null;
  evidence_summary: string | null;
  remediation: string | null;
  request_data: string | null;
  response_data: string | null;
  executed_at: string | null;
  created_at: string;
};

export type Evidence = {
  id: string;
  scenario_result_id: string;
  evidence_type: 'request' | 'response' | 'screenshot' | 'log' | 'raw';
  title: string;
  content: string | null;
  file_url: string | null;
  created_at: string;
};

export type ScanLog = {
  id: string;
  scan_run_id: string | null;
  project_id: string | null;
  actor: string;
  action: string;
  target: string | null;
  detail: string | null;
  created_at: string;
};

// In-Memory Mock Store for offline / demo mode
const mockProjects: Project[] = [
  {
    id: 'proj-1',
    client_name: 'Mozafar Gold',
    target_domain: 'mozafargold.ir',
    description: 'Financial & e-commerce security assessment for precious metals trading platform',
    status: 'active',
    created_at: '2026-08-01T10:00:00.000Z',
    updated_at: '2026-08-01T10:00:00.000Z',
  },
];

const mockScopes: AuthorizedScope[] = [
  {
    id: 'scope-1',
    project_id: 'proj-1',
    host_pattern: '*.mozafargold.ir',
    scope_type: 'wildcard',
    status: 'approved',
    authorized_by: 'Security Officer',
    authorized_at: '2026-08-01T10:05:00.000Z',
    consent_document: 'Contract-2026-001',
    notes: 'Authorized full PTaaS automated & manual testing suite',
    created_at: '2026-08-01T10:05:00.000Z',
  },
];

const mockScanRuns: ScanRun[] = [
  {
    id: 'scan-1',
    project_id: 'proj-1',
    scope_id: 'scope-1',
    target_url: 'https://api.mozafargold.ir',
    status: 'completed',
    scan_profile: 'full',
    total_scenarios: 101,
    passed: 88,
    failed: 0,
    vulnerable: 8,
    manual_review: 5,
    pending: 0,
    started_at: '2026-08-05T14:00:00.000Z',
    completed_at: '2026-08-05T14:45:00.000Z',
    created_at: '2026-08-05T14:00:00.000Z',
  },
];

const mockScenarioResults: ScenarioResult[] = [
  {
    id: 'res-1',
    scan_run_id: 'scan-1',
    scenario_code: 'SCN-001',
    scenario_title: 'Code Injection',
    category: 'Input Handling',
    execution_type: 'auto',
    status: 'vulnerable',
    severity: 'critical',
    cvss_score: 9.5,
    tool_used: 'Nuclei templates',
    evidence_summary: 'Arbitrary command execution via unsafe parameter parsing in API callback handler.',
    remediation: 'Sanitize input and enforce strict type validation server-side.',
    request_data: 'POST /api/v1/calc HTTP/1.1\r\nHost: api.mozafargold.ir\r\nContent-Type: application/json\r\n\r\n{"expr": "process.exit()"}',
    response_data: 'HTTP/1.1 500 Internal Server Error\r\nContent-Type: application/json\r\n\r\n{"error": "EvalError in expression"}',
    executed_at: '2026-08-05T14:05:00.000Z',
    created_at: '2026-08-05T14:05:00.000Z',
  },
  {
    id: 'res-2',
    scan_run_id: 'scan-1',
    scenario_code: 'SCN-010',
    scenario_title: 'SQL Injection (User-Agent / params)',
    category: 'Input Handling',
    execution_type: 'auto',
    status: 'vulnerable',
    severity: 'critical',
    cvss_score: 9.5,
    tool_used: 'sqlmap (headers mode)',
    evidence_summary: 'Time-based blind SQL injection in User-Agent tracking header.',
    remediation: 'Use parameterized SQL queries and ORM binding.',
    request_data: 'GET /api/v1/catalog HTTP/1.1\r\nUser-Agent: \'; SELECT PG_SLEEP(5)--',
    response_data: 'HTTP/1.1 200 OK (Response delay: 5.02s)',
    executed_at: '2026-08-05T14:10:00.000Z',
    created_at: '2026-08-05T14:10:00.000Z',
  },
  {
    id: 'res-3',
    scan_run_id: 'scan-1',
    scenario_code: 'SCN-019',
    scenario_title: 'XSS (Reflected / Stored / DOM)',
    category: 'Input Handling',
    execution_type: 'auto',
    status: 'vulnerable',
    severity: 'high',
    cvss_score: 7.5,
    tool_used: 'ZAP Active Scan + headless browser',
    evidence_summary: 'Reflected XSS in search parameter on user portal.',
    remediation: 'Apply context-aware HTML output encoding.',
    request_data: 'GET /search?q=<script>alert(1)</script> HTTP/1.1',
    response_data: 'HTTP/1.1 200 OK\r\n\r\n<div>Search results for: <script>alert(1)</script></div>',
    executed_at: '2026-08-05T14:15:00.000Z',
    created_at: '2026-08-05T14:15:00.000Z',
  },
  {
    id: 'res-4',
    scan_run_id: 'scan-1',
    scenario_code: 'SCN-041',
    scenario_title: 'No Signature',
    category: 'JWT Attacks',
    execution_type: 'auto',
    status: 'vulnerable',
    severity: 'critical',
    cvss_score: 9.5,
    tool_used: 'jwt_tool',
    evidence_summary: 'JWT algorithm "none" accepted by authorization middleware.',
    remediation: 'Enforce asymmetric/symmetric signature verification on all JWT tokens.',
    request_data: 'Authorization: Bearer eyJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiJ9.',
    response_data: 'HTTP/1.1 200 OK\r\n{"status": "authorized", "role": "admin"}',
    executed_at: '2026-08-05T14:20:00.000Z',
    created_at: '2026-08-05T14:20:00.000Z',
  },
  {
    id: 'res-5',
    scan_run_id: 'scan-1',
    scenario_code: 'SCN-051',
    scenario_title: 'Secret Key in JS File',
    category: 'Cryptography / Secret Key',
    execution_type: 'auto',
    status: 'vulnerable',
    severity: 'critical',
    cvss_score: 9.5,
    tool_used: 'Regex scanner',
    evidence_summary: 'Exposed internal API token in frontend bundle main.js.',
    remediation: 'Revoke key immediately and move sensitive credentials server-side.',
    request_data: 'GET /static/js/main.js',
    response_data: 'const API_KEY = "sec_live_9f8a3b1c2d0e4f5a6b7c8d9e0f";',
    executed_at: '2026-08-05T14:25:00.000Z',
    created_at: '2026-08-05T14:25:00.000Z',
  },
  {
    id: 'res-6',
    scan_run_id: 'scan-1',
    scenario_code: 'SCN-053',
    scenario_title: 'Charge Account IDOR',
    category: 'Financial Logic',
    execution_type: 'semi-auto',
    status: 'vulnerable',
    severity: 'critical',
    cvss_score: 9.5,
    tool_used: 'Manual Repeater',
    evidence_summary: 'Account ID parameter in deposit endpoint allows specifying arbitrary wallet IDs.',
    remediation: 'Verify wallet ownership against authenticated user session.',
    request_data: 'POST /api/v1/wallet/charge HTTP/1.1\r\n{"walletId": "target-wallet-99", "amount": 1000}',
    response_data: 'HTTP/1.1 200 OK\r\n{"status": "success", "chargedWallet": "target-wallet-99"}',
    executed_at: '2026-08-05T14:30:00.000Z',
    created_at: '2026-08-05T14:30:00.000Z',
  },
  {
    id: 'res-7',
    scan_run_id: 'scan-1',
    scenario_code: 'SCN-054',
    scenario_title: 'Race Condition (Financial)',
    category: 'Financial Logic',
    execution_type: 'manual',
    status: 'manual_review',
    severity: 'critical',
    cvss_score: 9.5,
    tool_used: 'Concurrent script',
    evidence_summary: 'Multiple concurrent requests permitted near-simultaneous balance withdrawal.',
    remediation: 'Implement SELECT FOR UPDATE database locks on wallet balance operations.',
    request_data: 'Concurrent POST /api/v1/withdraw (x10 threads)',
    response_data: 'Multiple 200 OK responses before lock acquisition',
    executed_at: '2026-08-05T14:35:00.000Z',
    created_at: '2026-08-05T14:35:00.000Z',
  },
  {
    id: 'res-8',
    scan_run_id: 'scan-1',
    scenario_code: 'SCN-100',
    scenario_title: 'Business Logic Testing',
    category: 'Business Logic',
    execution_type: 'manual',
    status: 'manual_review',
    severity: 'critical',
    cvss_score: 9.5,
    tool_used: 'Manual inspection',
    evidence_summary: 'Gold rate conversion calculation allows rounding exploits under micro-transactions.',
    remediation: 'Enforce server-side invariant checks and fixed-precision decimal math.',
    request_data: 'POST /api/v1/trade/gold\r\n{"amountGrams": 0.0000001}',
    response_data: 'Calculated cost: 0 IRR',
    executed_at: '2026-08-05T14:40:00.000Z',
    created_at: '2026-08-05T14:40:00.000Z',
  },
];

const mockScanLogs: ScanLog[] = [
  {
    id: 'log-1',
    scan_run_id: null,
    project_id: 'proj-1',
    actor: 'Security Analyst',
    action: 'project_created',
    target: 'mozafargold.ir',
    detail: 'Project Mozafar Gold initialized',
    created_at: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'log-2',
    scan_run_id: null,
    project_id: 'proj-1',
    actor: 'Security Officer',
    action: 'scope_approved',
    target: '*.mozafargold.ir',
    detail: 'Authorized scope approved',
    created_at: '2026-08-01T10:05:00.000Z',
  },
  {
    id: 'log-3',
    scan_run_id: 'scan-1',
    project_id: 'proj-1',
    actor: 'Lead Pentester',
    action: 'scan_completed',
    target: 'https://api.mozafargold.ir',
    detail: 'Full scan run completed with 101 scenarios evaluated',
    created_at: '2026-08-05T14:45:00.000Z',
  },
];

const mockStore: Record<string, any[]> = {
  projects: mockProjects,
  authorized_scopes: mockScopes,
  scan_runs: mockScanRuns,
  scenario_results: mockScenarioResults,
  evidence: [],
  scan_logs: mockScanLogs,
};

// Mock Query Builder
class MockQueryBuilder {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private sortFn: ((a: any, b: any) => number) | null = null;
  private limitVal: number | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns?: string) {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((item) => values.includes(item[column]));
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    const asc = opts?.ascending !== false;
    this.sortFn = (a, b) => {
      if (a[column] < b[column]) return asc ? -1 : 1;
      if (a[column] > b[column]) return asc ? 1 : -1;
      return 0;
    };
    return this;
  }

  limit(count: number) {
    this.limitVal = count;
    return this;
  }

  async maybeSingle() {
    const res = await this.then();
    return { data: res.data?.[0] || null, error: null };
  }

  async single() {
    const res = await this.then();
    return { data: res.data?.[0] || null, error: null };
  }

  async insert(data: any | any[]) {
    const rows = Array.isArray(data) ? data : [data];
    const target = mockStore[this.tableName] || [];
    const inserted: any[] = [];
    for (const row of rows) {
      const newRow = {
        id: row.id || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...row,
      };
      target.unshift(newRow);
      inserted.push(newRow);

      // If inserting a scan run in mock mode, generate scenario results and mark completed
      if (this.tableName === 'scan_runs') {
        newRow.status = 'completed';
        newRow.total_scenarios = 101;
        newRow.passed = 88;
        newRow.failed = 0;
        newRow.vulnerable = 8;
        newRow.manual_review = 5;
        newRow.completed_at = new Date().toISOString();

        // Populate scenario results if not already present
        const existingResults = mockStore['scenario_results'].filter((r) => r.scan_run_id === newRow.id);
        if (existingResults.length === 0) {
          const sampleCodes = ['SCN-001', 'SCN-010', 'SCN-019', 'SCN-041', 'SCN-051', 'SCN-053', 'SCN-054', 'SCN-100'];
          sampleCodes.forEach((code, idx) => {
            const sc = SCENARIOS.find((s) => s.code === code);
            mockStore['scenario_results'].push({
              id: `res-${newRow.id}-${idx}`,
              scan_run_id: newRow.id,
              scenario_code: code,
              scenario_title: sc?.title || code,
              category: sc?.category || 'Input Handling',
              execution_type: sc?.executionType || 'auto',
              status: idx < 6 ? 'vulnerable' : 'manual_review',
              severity: sc?.severity || 'high',
              cvss_score: sc?.severity === 'critical' ? 9.5 : 7.5,
              tool_used: sc?.tool || 'PTaaS Engine',
              evidence_summary: sc?.description || 'Automated finding detected.',
              remediation: REMEDIATION_TEMPLATES[sc?.category || 'Input Handling'] || 'Apply input sanitization.',
              request_data: `GET /test-${code} HTTP/1.1`,
              response_data: 'HTTP/1.1 200 OK',
              executed_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            });
          });
        }
      }
    }
    mockStore[this.tableName] = target;
    return {
      data: Array.isArray(data) ? inserted : inserted[0],
      error: null,
      select: () => ({
        single: async () => ({ data: inserted[0], error: null }),
      }),
    };
  }

  async update(updates: any) {
    const target = mockStore[this.tableName] || [];
    for (const item of target) {
      if (this.filters.every((f) => f(item))) {
        Object.assign(item, updates, { updated_at: new Date().toISOString() });
      }
    }
    return { data: null, error: null };
  }

  async delete() {
    let target = mockStore[this.tableName] || [];
    target = target.filter((item) => !this.filters.every((f) => f(item)));
    mockStore[this.tableName] = target;
    return { data: null, error: null };
  }

  // Thenable for await
  then(resolve?: (value: { data: any[]; error: null }) => void) {
    let list = [...(mockStore[this.tableName] || [])];
    for (const filter of this.filters) {
      list = list.filter(filter);
    }
    if (this.sortFn) {
      list.sort(this.sortFn);
    }
    if (this.limitVal !== null) {
      list = list.slice(0, this.limitVal);
    }
    const result = { data: list, error: null };
    if (resolve) resolve(result);
    return Promise.resolve(result);
  }
}

// Create real or mock client
const realClient = isRealSupabase
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  : null;

export const supabase: any = isRealSupabase
  ? realClient
  : {
      from: (tableName: string) => new MockQueryBuilder(tableName),
    };
