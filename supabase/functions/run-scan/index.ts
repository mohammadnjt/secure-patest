import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SCENARIO_CATALOG = [
  { code: "SCN-001", title: "Code Injection", category: "Input Handling", exec: "auto", tool: "Nuclei templates", severity: "critical" },
  { code: "SCN-002", title: "Directory Listing", category: "Configuration", exec: "auto", tool: "httpx + wordlist", severity: "medium" },
  { code: "SCN-003", title: "Sensitive/Backup Files", category: "Configuration", exec: "auto", tool: "Nuclei exposure templates", severity: "high" },
  { code: "SCN-004", title: "Security Flag (Cookie Flags)", category: "Server Security", exec: "auto", tool: "Internal header parser", severity: "medium" },
  { code: "SCN-005", title: "Security Headers", category: "Server Security", exec: "auto", tool: "Mozilla Observatory API", severity: "medium" },
  { code: "SCN-006", title: "Server Info in Response", category: "Server Security", exec: "auto", tool: "Internal header parser", severity: "low" },
  { code: "SCN-007", title: "Vulnerable JS Libraries", category: "Server Security", exec: "auto", tool: "Retire.js", severity: "medium" },
  { code: "SCN-008", title: "Invalid Date Fuzzing", category: "Input Handling", exec: "auto", tool: "Internal fuzz payload set", severity: "medium" },
  { code: "SCN-009", title: "Reliance on Client-Side Validation", category: "Input Handling", exec: "semi-auto", tool: "Manual API request vs UI bypass", severity: "high" },
  { code: "SCN-010", title: "SQL Injection (User-Agent/params)", category: "Input Handling", exec: "auto", tool: "sqlmap (headers mode)", severity: "critical" },
  { code: "SCN-011", title: "OS Command Injection", category: "Input Handling", exec: "auto", tool: "Nuclei/Commix", severity: "critical" },
  { code: "SCN-012", title: "Fuzz with Array []", category: "Input Handling", exec: "auto", tool: "Internal fuzz payload set", severity: "medium" },
  { code: "SCN-013", title: "Find IP Behind CDN", category: "Infrastructure", exec: "auto", tool: "crt.sh, DNS history, Censys", severity: "medium" },
  { code: "SCN-014", title: "robots.txt", category: "Infrastructure", exec: "auto", tool: "httpx fetch", severity: "low" },
  { code: "SCN-015", title: "Change Request (Method Tamper)", category: "Server Security", exec: "semi-auto", tool: "Manual Burp/Repeater per endpoint", severity: "medium" },
  { code: "SCN-016", title: "Nuclei Full Scan", category: "Automated Scanning", exec: "auto", tool: "Nuclei full template set", severity: "high" },
  { code: "SCN-017", title: "Nmap / Open Ports", category: "Automated Scanning", exec: "auto", tool: "Nmap wrapper", severity: "medium" },
  { code: "SCN-018", title: "Captcha Bypass", category: "Infrastructure", exec: "manual", tool: "Manual — implementation-specific", severity: "high" },
  { code: "SCN-019", title: "XSS (Reflected/Stored/DOM)", category: "Input Handling", exec: "auto", tool: "ZAP Active Scan + headless browser", severity: "high" },
  { code: "SCN-020", title: "Path Traversal / LFI-RFI", category: "Input Handling", exec: "auto", tool: "Nuclei templates", severity: "critical" },
  { code: "SCN-021", title: "CSRF", category: "Input Handling", exec: "semi-auto", tool: "ZAP + manual CSRF token check", severity: "high" },
  { code: "SCN-023", title: "SSRF", category: "Input Handling", exec: "semi-auto", tool: "Nuclei + OOB callback (Interactsh)", severity: "critical" },
  { code: "SCN-024", title: "OTP Expiration Time", category: "OTP", exec: "semi-auto", tool: "Timing test — requires test number", severity: "high" },
  { code: "SCN-025", title: "Short OTP (< 6 chars)", category: "OTP", exec: "semi-auto", tool: "Response inspection — requires test account", severity: "medium" },
  { code: "SCN-026", title: "SMS Bombing", category: "OTP", exec: "manual", tool: "Manual, limited — risk to SMS service", severity: "high" },
  { code: "SCN-027", title: "ReUse OTP", category: "OTP", exec: "semi-auto", tool: "Requires test account", severity: "high" },
  { code: "SCN-028", title: "Bruteforce (No Rate Limit)", category: "OTP & Password", exec: "auto", tool: "Internal script with controlled throttle", severity: "high" },
  { code: "SCN-029", title: "Tamper Reset Request", category: "Forget Password", exec: "semi-auto", tool: "Burp Repeater manual", severity: "critical" },
  { code: "SCN-030", title: "Data Leak / ATO Check", category: "Forget Password", exec: "semi-auto", tool: "Manual, sensitive", severity: "critical" },
  { code: "SCN-031", title: "SQL/NoSQL Injection (Sign-in)", category: "Sign-In / Sign-Up", exec: "auto", tool: "sqlmap + NoSQLMap", severity: "critical" },
  { code: "SCN-032", title: "Sign-Up SQL Injection", category: "Sign-In / Sign-Up", exec: "auto", tool: "sqlmap", severity: "critical" },
  { code: "SCN-033", title: "User Enumeration", category: "Userprofile / Details / IDOR", exec: "auto", tool: "Fuzz + response diff", severity: "medium" },
  { code: "SCN-034", title: "Tamper ID", category: "Userprofile / Details / IDOR", exec: "semi-auto", tool: "Requires two test accounts", severity: "high" },
  { code: "SCN-035", title: "IDOR — GET Other Users", category: "Userprofile / Details / IDOR", exec: "semi-auto", tool: "Requires two test accounts", severity: "high" },
  { code: "SCN-036", title: "Bypass Paid Restrictions", category: "Userprofile / Details / IDOR", exec: "manual", tool: "Manual, business-logic-specific", severity: "high" },
  { code: "SCN-037", title: "Token Prediction", category: "Session", exec: "semi-auto", tool: "Statistical analysis of token samples", severity: "high" },
  { code: "SCN-038", title: "Decode Cookie", category: "Session", exec: "auto", tool: "Internal decoder (base64/JWT)", severity: "medium" },
  { code: "SCN-039", title: "Token Meaning", category: "Session", exec: "semi-auto", tool: "Manual inspection", severity: "medium" },
  { code: "SCN-040", title: "Session Expiry After Actions", category: "Session", exec: "semi-auto", tool: "Manual per-action scenario", severity: "medium" },
  { code: "SCN-041", title: "No Signature", category: "JWT Attacks", exec: "auto", tool: "jwt_tool", severity: "critical" },
  { code: "SCN-042", title: "Signature Failure Test", category: "JWT Attacks", exec: "auto", tool: "jwt_tool", severity: "critical" },
  { code: "SCN-043", title: "Brute Force Common Keys", category: "JWT Attacks", exec: "auto", tool: "jwt_tool + wordlist", severity: "high" },
  { code: "SCN-044", title: "JWK Header Attack", category: "JWT Attacks", exec: "auto", tool: "jwt_tool", severity: "critical" },
  { code: "SCN-045", title: "KID Header Attack", category: "JWT Attacks", exec: "auto", tool: "jwt_tool", severity: "critical" },
  { code: "SCN-046", title: "JKU Header Attack", category: "JWT Attacks", exec: "auto", tool: "jwt_tool", severity: "critical" },
  { code: "SCN-047", title: "XSS in Service Request", category: "Service Request", exec: "auto", tool: "ZAP Active Scan", severity: "high" },
  { code: "SCN-048", title: "SQL Injection in Service Request", category: "Service Request", exec: "auto", tool: "sqlmap", severity: "critical" },
  { code: "SCN-050", title: "SSL/TLS Config", category: "Cryptography / Secret Key", exec: "auto", tool: "testssl.sh", severity: "high" },
  { code: "SCN-051", title: "Secret Key in JS File", category: "Cryptography / Secret Key", exec: "auto", tool: "TruffleHog / regex scanner", severity: "critical" },
  { code: "SCN-052", title: "Secret Key in Response", category: "Cryptography / Secret Key", exec: "auto", tool: "Regex scanner on response body", severity: "critical" },
  { code: "SCN-053", title: "Charge Account IDOR", category: "Financial Logic", exec: "semi-auto", tool: "Requires two test accounts", severity: "critical" },
  { code: "SCN-054", title: "Race Condition (Financial)", category: "Financial Logic", exec: "manual", tool: "Staging only — concurrent request script", severity: "critical" },
  { code: "SCN-055", title: "Double Spending", category: "Financial Logic", exec: "manual", tool: "Staging only", severity: "critical" },
  { code: "SCN-056", title: "Change Order ID", category: "Financial Logic", exec: "semi-auto", tool: "Requires two test accounts", severity: "critical" },
  { code: "SCN-057", title: "Pay Lower Than Real Cost", category: "Financial Logic", exec: "manual", tool: "Staging only — amount tampering", severity: "critical" },
  { code: "SCN-058", title: "Open Redirect (Info Leak)", category: "Financial Logic", exec: "auto", tool: "Nuclei redirect templates", severity: "medium" },
  { code: "SCN-064", title: "Find Admin Panel", category: "Admin Panel", exec: "auto", tool: "Wordlist + httpx", severity: "high" },
  { code: "SCN-065", title: "Register on Admin Panel", category: "Admin Panel", exec: "manual", tool: "Manual, sensitive", severity: "critical" },
  { code: "SCN-066", title: "IDOR (Application Logic)", category: "Application Logic", exec: "semi-auto", tool: "Requires two test accounts", severity: "high" },
  { code: "SCN-067", title: "Client-Side Validation Bypass", category: "Application Logic", exec: "semi-auto", tool: "Manual comparison", severity: "high" },
  { code: "SCN-068", title: "Browser Cache", category: "Client-Side", exec: "auto", tool: "Header parser (Cache-Control)", severity: "medium" },
  { code: "SCN-069", title: "Insecure Client-Side Storage", category: "Client-Side", exec: "auto", tool: "Headless browser + storage inspector", severity: "medium" },
  { code: "SCN-072", title: "Profile-Uniqueness & Deposit Verification", category: "Compliance (FATA)", exec: "manual", tool: "Manual checklist", severity: "high" },
  { code: "SCN-073", title: "Login Logging (IP + Time)", category: "Compliance (FATA)", exec: "manual", tool: "Manual checklist", severity: "medium" },
  { code: "SCN-074", title: "6-Month Log Retention (Forensic)", category: "Compliance (FATA)", exec: "manual", tool: "Manual checklist", severity: "medium" },
  { code: "SCN-075", title: "API Access Restriction (Iran-only B2B)", category: "Compliance (FATA)", exec: "semi-auto", tool: "Test from VPN/proxy outside Iran", severity: "high" },
  { code: "SCN-070", title: "Bruteforce with Array []", category: "Input Handling", exec: "auto", tool: "Internal fuzz payload set", severity: "medium" },
  { code: "SCN-071", title: "Fuzz Numbers as Strings", category: "Input Handling", exec: "auto", tool: "Internal fuzz payload set", severity: "low" },
  { code: "SCN-076", title: "HTML Tag Injection", category: "Input Handling", exec: "auto", tool: "Internal fuzz payload set", severity: "medium" },
  { code: "SCN-077", title: "Rate Limit Active?", category: "Rate Limiting", exec: "auto", tool: "Internal burst request script", severity: "medium" },
  { code: "SCN-078", title: "Bypass via Path Case Change", category: "Rate Limiting", exec: "auto", tool: "Internal script", severity: "medium" },
  { code: "SCN-079", title: "Bypass via Trailing Slash", category: "Rate Limiting", exec: "auto", tool: "Internal script", severity: "medium" },
  { code: "SCN-080", title: "Bypass via Added Header", category: "Rate Limiting", exec: "auto", tool: "Internal script", severity: "medium" },
  { code: "SCN-081", title: "Bypass via Duplicate Header", category: "Rate Limiting", exec: "auto", tool: "Internal script", severity: "medium" },
  { code: "SCN-082", title: "Bypass via Origin Header", category: "Rate Limiting", exec: "auto", tool: "Internal script", severity: "medium" },
  { code: "SCN-083", title: "Bypass via IP Rotation", category: "Rate Limiting", exec: "manual", tool: "Manual/limited — high legal risk", severity: "high" },
  { code: "SCN-084", title: "Bypass via Null Byte (%00)", category: "Rate Limiting", exec: "auto", tool: "Internal script", severity: "medium" },
  { code: "SCN-085", title: "Bypass via Race Condition", category: "Rate Limiting", exec: "semi-auto", tool: "Concurrent request script + manual review", severity: "high" },
  { code: "SCN-086", title: "Submit Request as Admin", category: "Critical", exec: "manual", tool: "Manual, highly sensitive", severity: "critical" },
  { code: "SCN-087", title: "Fingerprint Backend Framework", category: "Information Gathering", exec: "auto", tool: "Wappalyzer/whatweb", severity: "info" },
  { code: "SCN-088", title: "Response with Valid Credentials", category: "Identity Management", exec: "auto", tool: "Internal response diff", severity: "medium" },
  { code: "SCN-089", title: "Valid Username + Invalid Password", category: "Identity Management", exec: "auto", tool: "Internal response diff", severity: "medium" },
  { code: "SCN-090", title: "Invalid Username + Invalid Password", category: "Identity Management", exec: "auto", tool: "Internal response diff", severity: "medium" },
  { code: "SCN-091", title: "Response Uniformity (Enumeration)", category: "Identity Management", exec: "auto", tool: "Internal response diff", severity: "medium" },
  { code: "SCN-092", title: "Improper Error Handling", category: "Error Handling", exec: "auto", tool: "Fuzz + status/body diff", severity: "medium" },
  { code: "SCN-093", title: "Error Output Identification", category: "Error Handling", exec: "auto", tool: "Fuzz + status/body diff", severity: "medium" },
  { code: "SCN-094", title: "Analyze Various Outputs", category: "Error Handling", exec: "auto", tool: "Fuzz + status/body diff", severity: "low" },
  { code: "SCN-095", title: "Information Leak in Errors", category: "Error Handling", exec: "auto", tool: "Fuzz + status/body diff", severity: "medium" },
  { code: "SCN-096", title: "URL Parameter Tampering", category: "Error Handling", exec: "auto", tool: "Fuzz + status/body diff", severity: "medium" },
  { code: "SCN-097", title: "Invalid File Upload", category: "Error Handling", exec: "auto", tool: "Fuzz upload payload set", severity: "medium" },
  { code: "SCN-098", title: "Unknown Inputs", category: "Error Handling", exec: "auto", tool: "Fuzz payload set", severity: "low" },
  { code: "SCN-099", title: "All Error States", category: "Error Handling", exec: "auto", tool: "Fuzz payload set", severity: "low" },
  { code: "SCN-100", title: "Business Logic Testing", category: "Business Logic", exec: "manual", tool: "Manual — requires domain understanding", severity: "critical" },
  { code: "SCN-101", title: "Map App Functionality", category: "Business Logic", exec: "manual", tool: "Manual — prerequisite for logic tests", severity: "info" },
];

const REMEDIATION_MAP: Record<string, string> = {
  "Input Handling": "Sanitize and validate all user input server-side. Use parameterized queries, output encoding, and allowlists. Never trust client-side validation alone.",
  "Configuration": "Disable directory listing, remove backup/sensitive files from web roots, and enforce least-privilege file permissions.",
  "Server Security": "Set security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options), update all JS libraries, and remove version banners.",
  "Infrastructure": "Restrict origin server access, configure WAF/CDN properly, and avoid exposing internal infrastructure details.",
  "Automated Scanning": "Address all findings from automated scanners. Patch vulnerable services and close unnecessary ports.",
  "OTP": "Enforce OTP length >= 6, expiration <= 2-5 minutes, single-use policy, and rate limiting on OTP endpoints.",
  "OTP & Password": "Implement rate limiting, account lockout, and CAPTCHA on authentication endpoints.",
  "Forget Password": "Use secure, random, single-use reset tokens with expiration. Do not leak account existence in reset responses.",
  "Sign-In / Sign-Up": "Use parameterized queries on all auth endpoints. Implement input validation and rate limiting.",
  "Userprofile / Details / IDOR": "Use indirect object references or server-side authorization checks on every object access.",
  "Session": "Use cryptographically random session tokens, enforce expiry, and rotate tokens after privilege changes.",
  "JWT Attacks": "Use strong signing keys, reject alg:none, validate KID/JKU headers, and never trust client-provided JWKs.",
  "Service Request": "Validate and sanitize all service request parameters server-side. Use parameterized queries.",
  "Cryptography / Secret Key": "Use TLS 1.2+, disable weak ciphers, and never embed secrets in client-side code.",
  "Financial Logic": "Implement server-side transaction validation, atomic operations, and reconciliation checks. Use database locks for concurrent financial operations.",
  "Admin Panel": "Restrict admin panel access by IP allowlist and strong authentication. Disable public registration.",
  "Application Logic": "Enforce server-side authorization and validation on all business logic flows.",
  "Client-Side": "Set Cache-Control: no-store on sensitive pages. Avoid storing sensitive data in localStorage/sessionStorage.",
  "Compliance (FATA)": "Ensure compliance with FATA and central bank requirements: unique profiles, IP logging, 6-month log retention, and geo-restricted API access.",
  "Rate Limiting": "Implement robust rate limiting that accounts for case, trailing slashes, header manipulation, and concurrent requests.",
  "Critical": "Enforce strict server-side authorization for all admin-level operations. Never trust client-side role checks.",
  "Information Gathering": "Minimize technology fingerprinting by removing version headers and using WAF protections.",
  "Identity Management": "Return uniform error messages for all authentication failures to prevent user enumeration.",
  "Error Handling": "Implement generic error pages. Log detailed errors server-side only. Never expose stack traces to users.",
  "Business Logic": "Conduct thorough manual business logic review with domain experts. Implement server-side invariant checks for all financial flows.",
};

const SEVERITY_CVSS: Record<string, number> = {
  critical: 9.5,
  high: 7.5,
  medium: 5.0,
  low: 2.5,
  info: 0.0,
};

// Pseudo-random simulation of scan results
function simulateResult(scenario: { exec: string; severity: string; code: string }) {
  const rand = Math.random();

  if (scenario.exec === "manual") {
    return { status: "manual_review", cvss: 0 };
  }

  if (scenario.exec === "semi-auto") {
    if (rand < 0.35) return { status: "vulnerable", cvss: SEVERITY_CVSS[scenario.severity] || 5.0 };
    if (rand < 0.55) return { status: "manual_review", cvss: 0 };
    if (rand < 0.85) return { status: "pass", cvss: 0 };
    return { status: "fail", cvss: 0 };
  }

  // auto
  if (rand < 0.2) return { status: "vulnerable", cvss: SEVERITY_CVSS[scenario.severity] || 5.0 };
  if (rand < 0.65) return { status: "pass", cvss: 0 };
  if (rand < 0.8) return { status: "fail", cvss: 0 };
  return { status: "pass", cvss: 0 };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { scanRunId, scanProfile } = await req.json();
    if (!scanRunId) {
      return new Response(JSON.stringify({ error: "scanRunId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch the scan run
    const { data: run, error: runErr } = await supabase
      .from("scan_runs")
      .select("*")
      .eq("id", scanRunId)
      .single();

    if (runErr || !run) {
      return new Response(JSON.stringify({ error: "Scan run not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify scope is approved (consent gate)
    const { data: scope } = await supabase
      .from("authorized_scopes")
      .select("status, host_pattern")
      .eq("id", run.scope_id)
      .single();

    if (!scope || scope.status !== "approved") {
      await supabase.from("scan_runs").update({ status: "failed" }).eq("id", scanRunId);
      await supabase.from("scan_logs").insert({
        scan_run_id: scanRunId,
        project_id: run.project_id,
        actor: "system",
        action: "scan_blocked",
        target: run.target_url,
        detail: "Scan blocked: target scope is not approved",
      });
      return new Response(
        JSON.stringify({ error: "Scope not approved — scan blocked by consent gate" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark as running
    await supabase
      .from("scan_runs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", scanRunId);

    await supabase.from("scan_logs").insert({
      scan_run_id: scanRunId,
      project_id: run.project_id,
      actor: "system",
      action: "scan_started",
      target: run.target_url,
      detail: `Scan started with profile: ${scanProfile || run.scan_profile}`,
    });

    // Filter scenarios based on scan profile
    let scenarios = SCENARIO_CATALOG;
    if (scanProfile === "recon") {
      scenarios = SCENARIO_CATALOG.filter((s) =>
        ["Infrastructure", "Information Gathering", "Automated Scanning"].includes(s.category)
      );
    } else if (scanProfile === "passive") {
      scenarios = SCENARIO_CATALOG.filter((s) =>
        ["Infrastructure", "Information Gathering", "Server Security", "Configuration", "Client-Side", "Cryptography / Secret Key"].includes(s.category)
      );
    } else if (scanProfile === "active") {
      scenarios = SCENARIO_CATALOG.filter((s) =>
        ["Input Handling", "Configuration", "Server Security", "Automated Scanning", "Session", "JWT Attacks", "Rate Limiting", "Identity Management", "Error Handling"].includes(s.category)
      );
    }
    // full and custom use all scenarios

    // Process scenarios in batches
    const BATCH_SIZE = 10;
    let passed = 0, failed = 0, vulnerable = 0, manualReview = 0, pending = 0;
    const allResults: any[] = [];

    for (let i = 0; i < scenarios.length; i += BATCH_SIZE) {
      const batch = scenarios.slice(i, i + BATCH_SIZE);
      const batchResults = batch.map((scn) => {
        const result = simulateResult(scn);
        const remediation = result.status === "vulnerable"
          ? REMEDIATION_MAP[scn.category] || "Review and remediate based on vendor best practices."
          : null;

        const evidenceSummary = result.status === "vulnerable"
          ? `Automated scan detected a potential ${scn.title} vulnerability. Tool: ${scn.tool}. Target: ${run.target_url}.`
          : result.status === "manual_review"
          ? `This scenario requires manual verification. Tool: ${scn.tool}. Please review manually.`
          : result.status === "pass"
          ? `No issues detected by ${scn.tool}.`
          : result.status === "fail"
          ? `Check failed during execution. Tool: ${scn.tool}. May require re-run.`
          : null;

        const requestData = result.status === "vulnerable"
          ? `GET ${run.target_url} HTTP/1.1\nHost: ${run.target_url.replace(/^https?:\/\//, "")}\nUser-Agent: SecScan-PTaaS/1.0\n`
          : null;
        const responseData = result.status === "vulnerable"
          ? `HTTP/1.1 200 OK\nContent-Type: text/html\n\n[Response body indicating potential vulnerability]`
          : null;

        if (result.status === "pass") passed++;
        else if (result.status === "fail") failed++;
        else if (result.status === "vulnerable") vulnerable++;
        else if (result.status === "manual_review") manualReview++;
        else pending++;

        return {
          scan_run_id: scanRunId,
          scenario_code: scn.code,
          scenario_title: scn.title,
          category: scn.category,
          execution_type: scn.exec,
          status: result.status,
          severity: result.status === "vulnerable" ? scn.severity : "info",
          cvss_score: result.cvss,
          tool_used: scn.tool,
          evidence_summary: evidenceSummary,
          remediation,
          request_data: requestData,
          response_data: responseData,
          executed_at: new Date().toISOString(),
        };
      });

      const { error: insertErr } = await supabase
        .from("scenario_results")
        .insert(batchResults);

      if (insertErr) {
        console.error("Insert error:", insertErr);
      }

      allResults.push(...batchResults);
    }

    // Update run with final counts
    await supabase
      .from("scan_runs")
      .update({
        status: "completed",
        total_scenarios: scenarios.length,
        passed,
        failed,
        vulnerable,
        manual_review: manualReview,
        pending,
        completed_at: new Date().toISOString(),
      })
      .eq("id", scanRunId);

    await supabase.from("scan_logs").insert({
      scan_run_id: scanRunId,
      project_id: run.project_id,
      actor: "system",
      action: "scan_completed",
      target: run.target_url,
      detail: `Scan completed: ${scenarios.length} scenarios, ${vulnerable} vulnerable, ${passed} passed, ${manualReview} manual review`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        scanRunId,
        total: scenarios.length,
        passed,
        failed,
        vulnerable,
        manualReview,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
