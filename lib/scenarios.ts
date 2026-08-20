export type ExecutionType = 'auto' | 'semi-auto' | 'manual';

export type Scenario = {
  code: string;
  title: string;
  category: string;
  executionType: ExecutionType;
  tool: string;
  description: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
};

export const SCENARIO_CATEGORIES = [
  'Input Handling',
  'Configuration',
  'Server Security',
  'Infrastructure',
  'Automated Scanning',
  'OTP',
  'OTP & Password',
  'Forget Password',
  'Sign-In / Sign-Up',
  'Userprofile / Details / IDOR',
  'Session',
  'JWT Attacks',
  'Service Request',
  'Cryptography / Secret Key',
  'Financial Logic',
  'Admin Panel',
  'Application Logic',
  'Client-Side',
  'Compliance (FATA)',
  'Rate Limiting',
  'Critical',
  'Information Gathering',
  'Identity Management',
  'Error Handling',
  'Business Logic',
] as const;

export const SCENARIOS: Scenario[] = [
  // Input Handling
  { code: 'SCN-001', title: 'Code Injection', category: 'Input Handling', executionType: 'auto', tool: 'Nuclei templates', description: 'Test for server-side code injection via user-controlled input that reaches an interpreter.', severity: 'critical' },
  { code: 'SCN-008', title: 'Invalid Date Fuzzing', category: 'Input Handling', executionType: 'auto', tool: 'Internal fuzz payload set', description: 'Fuzz date fields with malformed, out-of-range, and edge-case values.', severity: 'medium' },
  { code: 'SCN-009', title: 'Reliance on Client-Side Validation', category: 'Input Handling', executionType: 'semi-auto', tool: 'Manual API request vs UI bypass', description: 'Compare direct API requests against UI validation to find bypasses.', severity: 'high' },
  { code: 'SCN-010', title: 'SQL Injection (User-Agent / params)', category: 'Input Handling', executionType: 'auto', tool: 'sqlmap (headers mode)', description: 'Test for SQL injection via User-Agent and parameter injection points.', severity: 'critical' },
  { code: 'SCN-011', title: 'OS Command Injection', category: 'Input Handling', executionType: 'auto', tool: 'Nuclei / Commix', description: 'Test for OS command injection through user input.', severity: 'critical' },
  { code: 'SCN-012', title: 'Fuzz with Array []', category: 'Input Handling', executionType: 'auto', tool: 'Internal fuzz payload set', description: 'Send array parameters to test parameter pollution and type confusion.', severity: 'medium' },
  { code: 'SCN-019', title: 'XSS (Reflected / Stored / DOM)', category: 'Input Handling', executionType: 'auto', tool: 'ZAP Active Scan + headless browser', description: 'Test for cross-site scripting across reflected, stored, and DOM vectors.', severity: 'high' },
  { code: 'SCN-020', title: 'Path Traversal / LFI-RFI', category: 'Input Handling', executionType: 'auto', tool: 'Nuclei templates', description: 'Test for local/remote file inclusion and path traversal.', severity: 'critical' },
  { code: 'SCN-021', title: 'CSRF', category: 'Input Handling', executionType: 'semi-auto', tool: 'ZAP + manual CSRF token check', description: 'Check for cross-site request forgery protections on state-changing endpoints.', severity: 'high' },
  { code: 'SCN-023', title: 'SSRF', category: 'Input Handling', executionType: 'semi-auto', tool: 'Nuclei + OOB callback (Interactsh)', description: 'Test for server-side request forgery with out-of-band callbacks.', severity: 'critical' },
  { code: 'SCN-070', title: 'Bruteforce with Array []', category: 'Input Handling', executionType: 'auto', tool: 'Internal fuzz payload set', description: 'Test bruteforce resistance with array-based parameter fuzzing.', severity: 'medium' },
  { code: 'SCN-071', title: 'Fuzz Numbers as Strings', category: 'Input Handling', executionType: 'auto', tool: 'Internal fuzz payload set', description: 'Send numeric payloads as strings to test type coercion handling.', severity: 'low' },
  { code: 'SCN-076', title: 'HTML Tag Injection', category: 'Input Handling', executionType: 'auto', tool: 'Internal fuzz payload set', description: 'Inject HTML tags to test for markup injection and content spoofing.', severity: 'medium' },

  // Configuration
  { code: 'SCN-002', title: 'Directory Listing', category: 'Configuration', executionType: 'auto', tool: 'httpx + wordlist', description: 'Check for exposed directory listings on web paths.', severity: 'medium' },
  { code: 'SCN-003', title: 'Sensitive / Backup Files', category: 'Configuration', executionType: 'auto', tool: 'Nuclei exposure templates', description: 'Scan for exposed backup, config, and sensitive files.', severity: 'high' },

  // Server Security
  { code: 'SCN-004', title: 'Security Flag (Cookie Flags)', category: 'Server Security', executionType: 'auto', tool: 'Internal header parser', description: 'Check cookies for HttpOnly, Secure, and SameSite flags.', severity: 'medium' },
  { code: 'SCN-005', title: 'Security Headers', category: 'Server Security', executionType: 'auto', tool: 'Mozilla Observatory API', description: 'Evaluate security headers (CSP, HSTS, X-Frame-Options, etc.).', severity: 'medium' },
  { code: 'SCN-006', title: 'Server Info in Response', category: 'Server Security', executionType: 'auto', tool: 'Internal header parser', description: 'Check for server version disclosure in HTTP headers.', severity: 'low' },
  { code: 'SCN-007', title: 'Vulnerable JS Libraries', category: 'Server Security', executionType: 'auto', tool: 'Retire.js', description: 'Detect outdated or vulnerable JavaScript libraries.', severity: 'medium' },
  { code: 'SCN-015', title: 'Change Request (Method Tamper)', category: 'Server Security', executionType: 'semi-auto', tool: 'Manual Burp/Repeater per endpoint', description: 'Test HTTP method tampering on each endpoint.', severity: 'medium' },

  // Infrastructure
  { code: 'SCN-013', title: 'Find IP Behind CDN', category: 'Infrastructure', executionType: 'auto', tool: 'crt.sh, DNS history, Censys', description: 'Discover origin IP behind CDN/WAF.', severity: 'medium' },
  { code: 'SCN-014', title: 'robots.txt', category: 'Infrastructure', executionType: 'auto', tool: 'httpx fetch', description: 'Fetch and analyze robots.txt for hidden paths.', severity: 'low' },
  { code: 'SCN-018', title: 'Captcha Bypass', category: 'Infrastructure', executionType: 'manual', tool: 'Manual — implementation-specific', description: 'Test captcha bypass — highly dependent on captcha implementation.', severity: 'high' },

  // Automated Scanning
  { code: 'SCN-016', title: 'Nuclei Full Scan', category: 'Automated Scanning', executionType: 'auto', tool: 'Nuclei full template set', description: 'Run Nuclei with the complete community + custom template set.', severity: 'high' },
  { code: 'SCN-017', title: 'Nmap / Open Ports', category: 'Automated Scanning', executionType: 'auto', tool: 'Nmap wrapper', description: 'Scan for open ports and services with Nmap.', severity: 'medium' },

  // OTP
  { code: 'SCN-024', title: 'OTP Expiration Time', category: 'OTP', executionType: 'semi-auto', tool: 'Timing test — requires test number', description: 'Verify OTP expiration is short enough (typically 2-5 minutes).', severity: 'high' },
  { code: 'SCN-025', title: 'Short OTP (< 6 chars)', category: 'OTP', executionType: 'semi-auto', tool: 'Response inspection — requires test account', description: 'Check if OTP length is at least 6 characters.', severity: 'medium' },
  { code: 'SCN-026', title: 'SMS Bombing', category: 'OTP', executionType: 'manual', tool: 'Manual, limited — risk to SMS service', description: 'Test OTP resend rate limiting to prevent SMS bombing. Manual due to risk.', severity: 'high' },
  { code: 'SCN-027', title: 'ReUse OTP', category: 'OTP', executionType: 'semi-auto', tool: 'Requires test account', description: 'Verify OTP cannot be reused after successful authentication.', severity: 'high' },

  // OTP & Password
  { code: 'SCN-028', title: 'Bruteforce (No Rate Limit)', category: 'OTP & Password', executionType: 'auto', tool: 'Internal script with controlled throttle', description: 'Test for rate limiting on authentication endpoints.', severity: 'high' },

  // Forget Password
  { code: 'SCN-029', title: 'Tamper Reset Request', category: 'Forget Password', executionType: 'semi-auto', tool: 'Burp Repeater manual', description: 'Tamper password reset request parameters for account takeover.', severity: 'critical' },
  { code: 'SCN-030', title: 'Data Leak / ATO Check', category: 'Forget Password', executionType: 'semi-auto', tool: 'Manual, sensitive', description: 'Check if password reset leaks account info or enables account takeover.', severity: 'critical' },

  // Sign-In / Sign-Up
  { code: 'SCN-031', title: 'SQL / NoSQL Injection (Sign-in)', category: 'Sign-In / Sign-Up', executionType: 'auto', tool: 'sqlmap + NoSQLMap', description: 'Test login endpoints for SQL and NoSQL injection.', severity: 'critical' },
  { code: 'SCN-032', title: 'Sign-Up SQL Injection', category: 'Sign-In / Sign-Up', executionType: 'auto', tool: 'sqlmap', description: 'Test registration endpoints for SQL injection.', severity: 'critical' },

  // Userprofile / Details / IDOR
  { code: 'SCN-033', title: 'User Enumeration', category: 'Userprofile / Details / IDOR', executionType: 'auto', tool: 'Fuzz + response diff', description: 'Enumerate valid users via response differences.', severity: 'medium' },
  { code: 'SCN-034', title: 'Tamper ID', category: 'Userprofile / Details / IDOR', executionType: 'semi-auto', tool: 'Requires two test accounts', description: 'Tamper object IDs to access other users data.', severity: 'high' },
  { code: 'SCN-035', title: 'IDOR — GET Other Users', category: 'Userprofile / Details / IDOR', executionType: 'semi-auto', tool: 'Requires two test accounts', description: 'Test IDOR by accessing other users resources via GET.', severity: 'high' },
  { code: 'SCN-036', title: 'Bypass Paid Restrictions', category: 'Userprofile / Details / IDOR', executionType: 'manual', tool: 'Manual, business-logic-specific', description: 'Attempt to bypass paid/premium feature restrictions.', severity: 'high' },

  // Session
  { code: 'SCN-037', title: 'Token Prediction', category: 'Session', executionType: 'semi-auto', tool: 'Statistical analysis of token samples', description: 'Analyze session tokens for predictability.', severity: 'high' },
  { code: 'SCN-038', title: 'Decode Cookie', category: 'Session', executionType: 'auto', tool: 'Internal decoder (base64/JWT)', description: 'Decode session cookies to check for sensitive data exposure.', severity: 'medium' },
  { code: 'SCN-039', title: 'Token Meaning', category: 'Session', executionType: 'semi-auto', tool: 'Manual inspection', description: 'Inspect token contents for meaningful/predictable data.', severity: 'medium' },
  { code: 'SCN-040', title: 'Session Expiry After Actions', category: 'Session', executionType: 'semi-auto', tool: 'Manual per-action scenario', description: 'Verify session expiry after sensitive operations.', severity: 'medium' },

  // JWT Attacks
  { code: 'SCN-041', title: 'No Signature', category: 'JWT Attacks', executionType: 'auto', tool: 'jwt_tool', description: 'Test if JWT with alg:none is accepted.', severity: 'critical' },
  { code: 'SCN-042', title: 'Signature Failure Test', category: 'JWT Attacks', executionType: 'auto', tool: 'jwt_tool', description: 'Test if invalid JWT signatures are rejected.', severity: 'critical' },
  { code: 'SCN-043', title: 'Brute Force Common Keys', category: 'JWT Attacks', executionType: 'auto', tool: 'jwt_tool + wordlist', description: 'Brute force JWT signing key with common/weak keys.', severity: 'high' },
  { code: 'SCN-044', title: 'JWK Header Attack', category: 'JWT Attacks', executionType: 'auto', tool: 'jwt_tool', description: 'Test JWK header injection attack.', severity: 'critical' },
  { code: 'SCN-045', title: 'KID Header Attack', category: 'JWT Attacks', executionType: 'auto', tool: 'jwt_tool', description: 'Test KID header path traversal / injection attack.', severity: 'critical' },
  { code: 'SCN-046', title: 'JKU Header Attack', category: 'JWT Attacks', executionType: 'auto', tool: 'jwt_tool', description: 'Test JKU header URL injection attack.', severity: 'critical' },

  // Service Request
  { code: 'SCN-047', title: 'XSS in Service Request', category: 'Service Request', executionType: 'auto', tool: 'ZAP Active Scan', description: 'Test service request forms for XSS.', severity: 'high' },
  { code: 'SCN-048', title: 'SQL Injection in Service Request', category: 'Service Request', executionType: 'auto', tool: 'sqlmap', description: 'Test service request parameters for SQL injection.', severity: 'critical' },

  // Cryptography / Secret Key
  { code: 'SCN-050', title: 'SSL / TLS Config', category: 'Cryptography / Secret Key', executionType: 'auto', tool: 'testssl.sh', description: 'Evaluate SSL/TLS configuration for weak ciphers and protocols.', severity: 'high' },
  { code: 'SCN-051', title: 'Secret Key in JS File', category: 'Cryptography / Secret Key', executionType: 'auto', tool: 'TruffleHog / regex scanner', description: 'Scan JavaScript bundles for embedded secrets/API keys.', severity: 'critical' },
  { code: 'SCN-052', title: 'Secret Key in Response', category: 'Cryptography / Secret Key', executionType: 'auto', tool: 'Regex scanner on response body', description: 'Scan HTTP response bodies for leaked secrets.', severity: 'critical' },

  // Financial Logic
  { code: 'SCN-053', title: 'Charge Account IDOR', category: 'Financial Logic', executionType: 'semi-auto', tool: 'Requires two test accounts', description: 'Test if user can charge/wrong account via IDOR on financial endpoints.', severity: 'critical' },
  { code: 'SCN-054', title: 'Race Condition (Financial)', category: 'Financial Logic', executionType: 'manual', tool: 'Staging only — concurrent request script', description: 'Test race conditions on financial operations. Staging only with manual verification.', severity: 'critical' },
  { code: 'SCN-055', title: 'Double Spending', category: 'Financial Logic', executionType: 'manual', tool: 'Staging only', description: 'Test for double-spending vulnerabilities. Staging environment only.', severity: 'critical' },
  { code: 'SCN-056', title: 'Change Order ID', category: 'Financial Logic', executionType: 'semi-auto', tool: 'Requires two test accounts', description: 'Tamper order IDs to manipulate transactions.', severity: 'critical' },
  { code: 'SCN-057', title: 'Pay Lower Than Real Cost', category: 'Financial Logic', executionType: 'manual', tool: 'Staging only — amount tampering', description: 'Manipulate payment amount in request to pay less. Staging only.', severity: 'critical' },
  { code: 'SCN-058', title: 'Open Redirect (Info Leak)', category: 'Financial Logic', executionType: 'auto', tool: 'Nuclei redirect templates', description: 'Test for open redirect that could leak data to external sites.', severity: 'medium' },

  // Admin Panel
  { code: 'SCN-064', title: 'Find Admin Panel', category: 'Admin Panel', executionType: 'auto', tool: 'Wordlist + httpx', description: 'Discover admin panel locations via wordlist enumeration.', severity: 'high' },
  { code: 'SCN-065', title: 'Register on Admin Panel', category: 'Admin Panel', executionType: 'manual', tool: 'Manual, sensitive', description: 'Test if admin panel registration is exposed. Manual due to sensitivity.', severity: 'critical' },

  // Application Logic
  { code: 'SCN-066', title: 'IDOR (Application Logic)', category: 'Application Logic', executionType: 'semi-auto', tool: 'Requires two test accounts', description: 'Test IDOR across application functionality.', severity: 'high' },
  { code: 'SCN-067', title: 'Client-Side Validation Bypass', category: 'Application Logic', executionType: 'semi-auto', tool: 'Manual comparison', description: 'Bypass client-side validation via direct API requests.', severity: 'high' },

  // Client-Side
  { code: 'SCN-068', title: 'Browser Cache', category: 'Client-Side', executionType: 'auto', tool: 'Header parser (Cache-Control)', description: 'Check Cache-Control headers to prevent caching of sensitive data.', severity: 'medium' },
  { code: 'SCN-069', title: 'Insecure Client-Side Storage', category: 'Client-Side', executionType: 'auto', tool: 'Headless browser + storage inspector', description: 'Inspect localStorage/sessionStorage for sensitive data.', severity: 'medium' },

  // Compliance (FATA)
  { code: 'SCN-072', title: 'Profile-Uniqueness & Deposit Verification', category: 'Compliance (FATA)', executionType: 'manual', tool: 'Manual checklist', description: 'Verify profile uniqueness and deposit-to-profile binding (FATA requirement).', severity: 'high' },
  { code: 'SCN-073', title: 'Login Logging (IP + Time)', category: 'Compliance (FATA)', executionType: 'manual', tool: 'Manual checklist', description: 'Verify logins are logged with IP and timestamp (FATA requirement).', severity: 'medium' },
  { code: 'SCN-074', title: '6-Month Log Retention (Forensic)', category: 'Compliance (FATA)', executionType: 'manual', tool: 'Manual checklist', description: 'Verify logs are retained for at least 6 months for forensic purposes.', severity: 'medium' },
  { code: 'SCN-075', title: 'API Access Restriction (Iran-only B2B)', category: 'Compliance (FATA)', executionType: 'semi-auto', tool: 'Test from VPN/proxy outside Iran', description: 'Verify API access is restricted to Iranian IPs for B2B endpoints.', severity: 'high' },

  // Rate Limiting
  { code: 'SCN-077', title: 'Rate Limit Active?', category: 'Rate Limiting', executionType: 'auto', tool: 'Internal burst request script', description: 'Verify rate limiting is active on critical endpoints.', severity: 'medium' },
  { code: 'SCN-078', title: 'Bypass via Path Case Change', category: 'Rate Limiting', executionType: 'auto', tool: 'Internal script', description: 'Attempt rate-limit bypass by changing path case.', severity: 'medium' },
  { code: 'SCN-079', title: 'Bypass via Trailing Slash', category: 'Rate Limiting', executionType: 'auto', tool: 'Internal script', description: 'Attempt rate-limit bypass by adding trailing slashes.', severity: 'medium' },
  { code: 'SCN-080', title: 'Bypass via Added Header', category: 'Rate Limiting', executionType: 'auto', tool: 'Internal script', description: 'Attempt rate-limit bypass by adding extra headers.', severity: 'medium' },
  { code: 'SCN-081', title: 'Bypass via Duplicate Header', category: 'Rate Limiting', executionType: 'auto', tool: 'Internal script', description: 'Attempt rate-limit bypass via duplicate headers.', severity: 'medium' },
  { code: 'SCN-082', title: 'Bypass via Origin Header', category: 'Rate Limiting', executionType: 'auto', tool: 'Internal script', description: 'Attempt rate-limit bypass by manipulating Origin header.', severity: 'medium' },
  { code: 'SCN-083', title: 'Bypass via IP Rotation', category: 'Rate Limiting', executionType: 'manual', tool: 'Manual/limited — high legal risk', description: 'Test rate-limit bypass with multiple IPs. Manual due to legal risk.', severity: 'high' },
  { code: 'SCN-084', title: 'Bypass via Null Byte (%00)', category: 'Rate Limiting', executionType: 'auto', tool: 'Internal script', description: 'Attempt rate-limit bypass via null byte injection in path.', severity: 'medium' },
  { code: 'SCN-085', title: 'Bypass via Race Condition', category: 'Rate Limiting', executionType: 'semi-auto', tool: 'Concurrent request script + manual review', description: 'Attempt rate-limit bypass via concurrent/raced requests.', severity: 'high' },

  // Critical
  { code: 'SCN-086', title: 'Submit Request as Admin', category: 'Critical', executionType: 'manual', tool: 'Manual, highly sensitive', description: 'Test if regular user can submit requests on behalf of admin. Very sensitive.', severity: 'critical' },

  // Information Gathering
  { code: 'SCN-087', title: 'Fingerprint Backend Framework', category: 'Information Gathering', executionType: 'auto', tool: 'Wappalyzer / whatweb', description: 'Identify backend framework and technologies.', severity: 'info' },

  // Identity Management
  { code: 'SCN-088', title: 'Response with Valid Credentials', category: 'Identity Management', executionType: 'auto', tool: 'Internal response diff', description: 'Analyze response behavior with valid username + password.', severity: 'medium' },
  { code: 'SCN-089', title: 'Valid Username + Invalid Password', category: 'Identity Management', executionType: 'auto', tool: 'Internal response diff', description: 'Check for user enumeration via response differences.', severity: 'medium' },
  { code: 'SCN-090', title: 'Invalid Username + Invalid Password', category: 'Identity Management', executionType: 'auto', tool: 'Internal response diff', description: 'Establish baseline response for invalid credentials.', severity: 'medium' },
  { code: 'SCN-091', title: 'Response Uniformity (Enumeration)', category: 'Identity Management', executionType: 'auto', tool: 'Internal response diff', description: 'Verify uniform responses to prevent user enumeration.', severity: 'medium' },

  // Error Handling
  { code: 'SCN-092', title: 'Improper Error Handling', category: 'Error Handling', executionType: 'auto', tool: 'Fuzz + status/body diff', description: 'Test for improper error handling that leaks information.', severity: 'medium' },
  { code: 'SCN-093', title: 'Error Output Identification', category: 'Error Handling', executionType: 'auto', tool: 'Fuzz + status/body diff', description: 'Identify and analyze error outputs from fuzzing.', severity: 'medium' },
  { code: 'SCN-094', title: 'Analyze Various Outputs', category: 'Error Handling', executionType: 'auto', tool: 'Fuzz + status/body diff', description: 'Analyze various error outputs for information leakage.', severity: 'low' },
  { code: 'SCN-095', title: 'Information Leak in Errors', category: 'Error Handling', executionType: 'auto', tool: 'Fuzz + status/body diff', description: 'Detect sensitive information leaked in error messages.', severity: 'medium' },
  { code: 'SCN-096', title: 'URL Parameter Tampering', category: 'Error Handling', executionType: 'auto', tool: 'Fuzz + status/body diff', description: 'Tamper URL parameters and analyze error behavior.', severity: 'medium' },
  { code: 'SCN-097', title: 'Invalid File Upload', category: 'Error Handling', executionType: 'auto', tool: 'Fuzz upload payload set', description: 'Test error handling with invalid file uploads.', severity: 'medium' },
  { code: 'SCN-098', title: 'Unknown Inputs', category: 'Error Handling', executionType: 'auto', tool: 'Fuzz payload set', description: 'Test error handling with unknown/unexpected inputs.', severity: 'low' },
  { code: 'SCN-099', title: 'All Error States', category: 'Error Handling', executionType: 'auto', tool: 'Fuzz payload set', description: 'Map all possible error states via comprehensive fuzzing.', severity: 'low' },

  // Business Logic
  { code: 'SCN-100', title: 'Business Logic Testing', category: 'Business Logic', executionType: 'manual', tool: 'Manual — requires domain understanding', description: 'Comprehensive business logic testing. Requires understanding of gold/financial domain.', severity: 'critical' },
  { code: 'SCN-101', title: 'Map App Functionality', category: 'Business Logic', executionType: 'manual', tool: 'Manual — prerequisite for logic tests', description: 'Map all application functionality as prerequisite for business logic testing.', severity: 'info' },
];

// Predefined CVSS scores by severity
export const SEVERITY_CVSS: Record<string, number> = {
  critical: 9.5,
  high: 7.5,
  medium: 5.0,
  low: 2.5,
  info: 0.0,
};

export const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  info: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

export const STATUS_COLORS: Record<string, string> = {
  pass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  fail: 'bg-red-500/10 text-red-400 border-red-500/30',
  vulnerable: 'bg-red-600/15 text-red-500 border-red-600/40',
  false_positive: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  manual_review: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  pending: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  skipped: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  queued: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  running: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
};

export const CONFIDENCE_COLORS: Record<string, string> = {
  certain: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  high: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  low: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

export const EXECUTION_TYPE_LABELS: Record<ExecutionType, string> = {
  auto: 'Automated',
  'semi-auto': 'Semi-Automated',
  manual: 'Manual',
};

export const EXECUTION_TYPE_ICONS: Record<ExecutionType, string> = {
  auto: 'Bot',
  'semi-auto': 'UserCog',
  manual: 'Hand',
};

// Remediation templates by category
export const REMEDIATION_TEMPLATES: Record<string, string> = {
  'Input Handling': 'Sanitize and validate all user input server-side. Use parameterized queries, output encoding, and allowlists. Never trust client-side validation alone.',
  Configuration: 'Disable directory listing, remove backup/sensitive files from web roots, and enforce least-privilege file permissions.',
  'Server Security': 'Set security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options), update all JS libraries, and remove version banners.',
  Infrastructure: 'Restrict origin server access, configure WAF/CDN properly, and avoid exposing internal infrastructure details.',
  'Automated Scanning': 'Address all findings from automated scanners. Patch vulnerable services and close unnecessary ports.',
  OTP: 'Enforce OTP length >= 6, expiration <= 2-5 minutes, single-use policy, and rate limiting on OTP endpoints.',
  'OTP & Password': 'Implement rate limiting, account lockout, and CAPTCHA on authentication endpoints.',
  'Forget Password': 'Use secure, random, single-use reset tokens with expiration. Do not leak account existence in reset responses.',
  'Sign-In / Sign-Up': 'Use parameterized queries on all auth endpoints. Implement input validation and rate limiting.',
  'Userprofile / Details / IDOR': 'Use indirect object references or server-side authorization checks on every object access.',
  Session: 'Use cryptographically random session tokens, enforce expiry, and rotate tokens after privilege changes.',
  'JWT Attacks': 'Use strong signing keys, reject alg:none, validate KID/JKU/JKU headers, and never trust client-provided JWKs.',
  'Service Request': 'Validate and sanitize all service request parameters server-side. Use parameterized queries.',
  'Cryptography / Secret Key': 'Use TLS 1.2+, disable weak ciphers, and never embed secrets in client-side code.',
  'Financial Logic': 'Implement server-side transaction validation, atomic operations, and reconciliation checks. Use database locks for concurrent financial operations.',
  'Admin Panel': 'Restrict admin panel access by IP allowlist and strong authentication. Disable public registration.',
  'Application Logic': 'Enforce server-side authorization and validation on all business logic flows.',
  'Client-Side': 'Set Cache-Control: no-store on sensitive pages. Avoid storing sensitive data in localStorage/sessionStorage.',
  'Compliance (FATA)': 'Ensure compliance with FATA and central bank requirements: unique profiles, IP logging, 6-month log retention, and geo-restricted API access.',
  'Rate Limiting': 'Implement robust rate limiting that accounts for case, trailing slashes, header manipulation, and concurrent requests.',
  Critical: 'Enforce strict server-side authorization for all admin-level operations. Never trust client-side role checks.',
  'Information Gathering': 'Minimize technology fingerprinting by removing version headers and using WAF protections.',
  'Identity Management': 'Return uniform error messages for all authentication failures to prevent user enumeration.',
  'Error Handling': 'Implement generic error pages. Log detailed errors server-side only. Never expose stack traces to users.',
  'Business Logic': 'Conduct thorough manual business logic review with domain experts. Implement server-side invariant checks for all financial flows.',
};

export function getScenarioByCode(code: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.code === code);
}

export function getScenariosByCategory(category: string): Scenario[] {
  return SCENARIOS.filter((s) => s.category === category);
}

export function getScenariosByExecutionType(type: ExecutionType): Scenario[] {
  return SCENARIOS.filter((s) => s.executionType === type);
}
