import { type ScanRun, type Project, type ScenarioResult } from './supabase-client';
import { format } from 'date-fns';

export function generateReportHTML(run: ScanRun, project: Project, results: ScenarioResult[]): string {
  const dateStr = run.created_at ? format(new Date(run.created_at), 'MMMM d, yyyy HH:mm') : format(new Date(), 'MMMM d, yyyy HH:mm');
  const exportDate = format(new Date(), 'MMMM d, yyyy HH:mm');

  const vulnerableResults = results
    .filter((r) => r.status === 'vulnerable')
    .sort((a, b) => (a.cvss_score || 0) < (b.cvss_score || 0) ? 1 : -1);

  const falsePositiveResults = results.filter((r) => r.status === 'false_positive');
  const manualResults = results.filter((r) => r.status === 'manual_review');
  const passResults = results.filter((r) => r.status === 'pass' || r.status === 'pending' || r.status === 'skipped');

  const severityCounts = {
    critical: results.filter((r) => r.status === 'vulnerable' && r.severity === 'critical').length,
    high: results.filter((r) => r.status === 'vulnerable' && r.severity === 'high').length,
    medium: results.filter((r) => r.status === 'vulnerable' && r.severity === 'medium').length,
    low: results.filter((r) => r.status === 'vulnerable' && r.severity === 'low').length,
    info: results.filter((r) => r.status === 'vulnerable' && r.severity === 'info').length,
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'critical': return 'bg-critical text-critical-fg border-critical-border';
      case 'high': return 'bg-high text-high-fg border-high-border';
      case 'medium': return 'bg-medium text-medium-fg border-medium-border';
      case 'low': return 'bg-low text-low-fg border-low-border';
      default: return 'bg-info text-info-fg border-info-border';
    }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SecScan PTaaS Assessment Report - ${escapeHtml(project.client_name)} (${escapeHtml(run.target_url)})</title>
  <style>
    :root {
      --bg: #0b0f17;
      --card-bg: #111827;
      --border: #1f2937;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #10b981;
      --accent: #0ea5e9;
      --error: #ef4444;
      --warning: #f59e0b;
      --success: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      padding: 32px 16px;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    header {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px;
      margin-bottom: 24px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .logo-area { display: flex; align-items: center; gap: 12px; }
    .logo-icon {
      width: 44px; height: 44px; border-radius: 10px;
      background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);
      display: flex; align-items: center; justify-content: center;
      color: var(--primary); font-size: 20px; font-weight: bold;
    }
    .brand-title { font-size: 20px; font-weight: 700; color: #fff; }
    .brand-subtitle { font-size: 13px; color: var(--text-muted); }
    .meta-box { text-align: right; font-size: 12px; color: var(--text-muted); }
    .meta-box strong { color: var(--text); }

    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 20px;
    }
    .stat-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .stat-value { font-size: 28px; font-weight: 800; font-family: monospace; }

    .stat-card.vuln { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }
    .stat-card.vuln .stat-label { color: #f87171; }
    .stat-card.vuln .stat-value { color: #ef4444; }

    .stat-card.review { border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05); }
    .stat-card.review .stat-label { color: #fbbf24; }
    .stat-card.review .stat-value { color: #f59e0b; }

    .stat-card.pass { border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.05); }
    .stat-card.pass .stat-label { color: #34d399; }
    .stat-card.pass .stat-value { color: #10b981; }

    .stat-card.total { border-color: rgba(14, 165, 233, 0.3); background: rgba(14, 165, 233, 0.05); }
    .stat-card.total .stat-label { color: #38bdf8; }
    .stat-card.total .stat-value { color: #0ea5e9; }

    .section-card {
      background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 24px;
    }
    .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }

    .sev-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .sev-pill { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; font-family: monospace; }
    .sev-critical { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); }
    .sev-high { background: rgba(249, 115, 22, 0.2); color: #fdba74; border: 1px solid rgba(249, 115, 22, 0.4); }
    .sev-medium { background: rgba(245, 158, 11, 0.2); color: #fde047; border: 1px solid rgba(245, 158, 11, 0.4); }
    .sev-low { background: rgba(14, 165, 233, 0.2); color: #7dd3fc; border: 1px solid rgba(14, 165, 233, 0.4); }
    .sev-info { background: rgba(107, 114, 128, 0.2); color: #e5e7eb; border: 1px solid rgba(107, 114, 128, 0.4); }

    .vuln-item {
      border: 1px solid var(--border); border-radius: 8px; padding: 18px; margin-bottom: 16px; background: rgba(255, 255, 255, 0.02);
    }
    .vuln-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .vuln-code { font-family: monospace; font-weight: 700; color: #fff; font-size: 14px; }
    .vuln-title { font-size: 15px; font-weight: 600; color: #f3f4f6; margin-top: 2px; }
    .cvss-tag { font-family: monospace; font-size: 13px; font-weight: 700; color: #ef4444; text-align: right; }

    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid transparent; }
    .bg-critical { background: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239, 68, 68, 0.4); }
    .bg-high { background: rgba(249, 115, 22, 0.2); color: #fb923c; border-color: rgba(249, 115, 22, 0.4); }
    .bg-medium { background: rgba(245, 158, 11, 0.2); color: #facc15; border-color: rgba(245, 158, 11, 0.4); }
    .bg-low { background: rgba(14, 165, 233, 0.2); color: #38bdf8; border-color: rgba(14, 165, 233, 0.4); }
    .bg-info { background: rgba(107, 114, 128, 0.2); color: #9ca3af; border-color: rgba(107, 114, 128, 0.4); }

    .sub-box { background: #0b0f17; border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-top: 10px; font-size: 12px; }
    .sub-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 4px; }
    pre { font-family: monospace; font-size: 11px; white-space: pre-wrap; word-break: break-all; color: #a7f3d0; overflow-x: auto; }

    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); }
    th { color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }

    footer {
      text-align: center; font-size: 11px; color: var(--text-muted); padding-top: 20px; border-top: 1px solid var(--border); margin-top: 32px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo-area">
        <div class="logo-icon">🛡️</div>
        <div>
          <div class="brand-title">SecScan PTaaS Assessment Report</div>
          <div class="brand-subtitle">${escapeHtml(project.client_name)} — ${escapeHtml(run.target_url)}</div>
        </div>
      </div>
      <div class="meta-box">
        <div><strong>Scan ID:</strong> ${escapeHtml(run.id)}</div>
        <div><strong>Profile:</strong> ${escapeHtml(run.scan_profile).toUpperCase()}</div>
        <div><strong>Assessment Date:</strong> ${escapeHtml(dateStr)}</div>
        <div><strong>Exported On:</strong> ${escapeHtml(exportDate)}</div>
      </div>
    </header>

    <div class="grid-4">
      <div class="stat-card vuln">
        <div class="stat-label">Vulnerabilities</div>
        <div class="stat-value">${run.vulnerable}</div>
      </div>
      <div class="stat-card review">
        <div class="stat-label">Manual Review</div>
        <div class="stat-value">${run.manual_review}</div>
      </div>
      <div class="stat-card pass">
        <div class="stat-label">Passed Scenarios</div>
        <div class="stat-value">${run.passed}</div>
      </div>
      <div class="stat-card total">
        <div class="stat-label">Total Scenarios</div>
        <div class="stat-value">${run.total_scenarios}</div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">Severity Distribution</div>
      <div class="sev-bar">
        <div class="sev-pill sev-critical">CRITICAL: ${severityCounts.critical}</div>
        <div class="sev-pill sev-high">HIGH: ${severityCounts.high}</div>
        <div class="sev-pill sev-medium">MEDIUM: ${severityCounts.medium}</div>
        <div class="sev-pill sev-low">LOW: ${severityCounts.low}</div>
        <div class="sev-pill sev-info">INFO: ${severityCounts.info}</div>
      </div>
    </div>

    ${vulnerableResults.length > 0 ? `
    <div class="section-card">
      <div class="section-title">
        <span>Vulnerability Findings (${vulnerableResults.length})</span>
      </div>
      ${vulnerableResults.map((r, idx) => `
        <div class="vuln-item">
          <div class="vuln-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="vuln-code">#${idx + 1} ${escapeHtml(r.scenario_code)}</span>
                ${r.confidence_level ? `<span class="badge" style="background: rgba(100, 116, 139, 0.2); color: #94a3b8; border-color: rgba(100, 116, 139, 0.4);">${escapeHtml(r.confidence_level).slice(0, 3)} CONF</span>` : ''}
                <span class="badge bg-${r.severity}">${escapeHtml(r.severity)}</span>
                <span style="font-size: 11px; color: var(--text-muted);">Category: ${escapeHtml(r.category)}</span>
              </div>
              <div class="vuln-title">${escapeHtml(r.scenario_title)}</div>
            </div>
            ${r.cvss_score ? `<div class="cvss-tag">CVSS ${r.cvss_score.toFixed(1)}</div>` : ''}
          </div>

          ${r.evidence_summary ? `
            <div class="sub-box">
              <div class="sub-title">Evidence Summary</div>
              <div>${escapeHtml(r.evidence_summary)}</div>
            </div>
          ` : ''}

          ${r.remediation ? `
            <div class="sub-box" style="border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.03);">
              <div class="sub-title" style="color: var(--primary);">Remediation Recommendation</div>
              <div style="color: #d1fae5;">${escapeHtml(r.remediation)}</div>
            </div>
          ` : ''}

          ${r.request_data ? `
            <div class="sub-box">
              <div class="sub-title">Request Payload</div>
              <pre>${escapeHtml(r.request_data)}</pre>
            </div>
          ` : ''}

          ${r.response_data ? `
            <div class="sub-box">
              <div class="sub-title">Response Evidence</div>
              <pre>${escapeHtml(r.response_data)}</pre>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
    ` : `
    <div class="section-card">
      <div class="section-title">Vulnerability Findings</div>
      <p style="font-size: 13px; color: var(--primary);">No active vulnerabilities detected during automated scenario evaluation.</p>
    </div>
    `}

    ${falsePositiveResults.length > 0 ? `
    <div class="section-card">
      <div class="section-title">False Positives (${falsePositiveResults.length})</div>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">The following findings were flagged by automated tools but manually marked as false positives.</p>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Scenario</th>
            <th>Confidence</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          ${falsePositiveResults.map((r) => `
            <tr>
              <td style="font-family: monospace; font-weight: bold; color: #a78bfa;">${escapeHtml(r.scenario_code)}</td>
              <td>${escapeHtml(r.scenario_title)}</td>
              <td style="text-transform: uppercase; font-size: 10px;">${escapeHtml(r.confidence_level || 'N/A')}</td>
              <td style="color: var(--text-muted);">${escapeHtml(r.category)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${manualResults.length > 0 ? `
    <div class="section-card">
      <div class="section-title">Manual Review Items (${manualResults.length})</div>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Scenario</th>
            <th>Category</th>
            <th>Tool / Vector</th>
          </tr>
        </thead>
        <tbody>
          ${manualResults.map((r) => `
            <tr>
              <td style="font-family: monospace; font-weight: bold;">${escapeHtml(r.scenario_code)}</td>
              <td>${escapeHtml(r.scenario_title)}</td>
              <td style="color: var(--text-muted);">${escapeHtml(r.category)}</td>
              <td style="color: var(--warning);">${escapeHtml(r.tool_used || 'Manual Analyst')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${passResults.length > 0 ? `
    <div class="section-card">
      <div class="section-title">Passed / Verified Scenarios (${passResults.length})</div>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Scenario</th>
            <th>Category</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${passResults.slice(0, 50).map((r) => `
            <tr>
              <td style="font-family: monospace;">${escapeHtml(r.scenario_code)}</td>
              <td>${escapeHtml(r.scenario_title)}</td>
              <td style="color: var(--text-muted);">${escapeHtml(r.category)}</td>
              <td style="color: var(--success); text-transform: uppercase; font-size: 11px; font-weight: bold;">${escapeHtml(r.status)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${passResults.length > 50 ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">... and ${passResults.length - 50} more passed scenarios.</div>` : ''}
    </div>
    ` : ''}

    <div class="section-card">
      <div class="section-title">Scope & Authorization Statement</div>
      <div style="font-size: 12px; color: var(--text-muted); line-height: 1.7;">
        <div><strong>Target URL:</strong> ${escapeHtml(run.target_url)}</div>
        <div><strong>Client Domain:</strong> ${escapeHtml(project.target_domain)} (${escapeHtml(project.client_name)})</div>
        <div><strong>Authorization Verification:</strong> Consent gate confirmed prior to scan initialization.</div>
      </div>
    </div>

    <footer>
      Generated by <strong>SecScan PTaaS</strong> — Automated Penetration Testing & Compliance Platform.<br>
      This document contains sensitive security findings and is intended solely for authorized technical personnel.
    </footer>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function downloadReportHTML(run: ScanRun, project: Project, results: ScenarioResult[]) {
  const htmlContent = generateReportHTML(run, project, results);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedClient = project.client_name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const sanitizedId = run.id.slice(0, 8);
  link.href = url;
  link.setAttribute('download', `SecScan-Report-${sanitizedClient}-${sanitizedId}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
