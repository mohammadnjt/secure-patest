'use client';

import { useState } from 'react';
import { type ScanRun, type Project, type ScenarioResult } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import { STATUS_COLORS, SEVERITY_COLORS, CONFIDENCE_COLORS } from '@/lib/scenarios';
import {
  FileText, Printer, Download, ChevronDown, Globe,
  CheckCircle2, XCircle, AlertTriangle, ShieldAlert, ScanLine, ShieldOff,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { downloadReportHTML } from '@/lib/export-html';
import Link from 'next/link';

const SEVERITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

export function ReportView({
  runs,
  selectedRun,
  project,
  results,
  projectMap,
  defaultScanId,
}: {
  runs: ScanRun[];
  selectedRun: ScanRun | null;
  project: Project | null;
  results: ScenarioResult[];
  projectMap: Map<string, Project>;
  defaultScanId?: string;
}) {
  const [scanId, setScanId] = useState(defaultScanId || runs[0]?.id || '');

  const currentRun = selectedRun || runs.find((r) => r.id === scanId) || runs[0] || null;
  const currentProject = currentRun ? projectMap.get(currentRun.project_id) : project;

  const vulnerableResults = results
    .filter((r) => r.status === 'vulnerable')
    .sort((a, b) => (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9));

  const falsePositiveResults = results.filter((r) => r.status === 'false_positive');
  const manualResults = results.filter((r) => r.status === 'manual_review');

  const handlePrint = () => {
    window.print();
  };

  if (runs.length === 0) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground">Generate and download penetration test reports</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-sm font-semibold">No completed scans</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Complete a scan run to generate a security assessment report.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header — hidden in print */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground">Security assessment report generator</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currentRun?.id || ''}
            onChange={(e) => {
              setScanId(e.target.value);
              window.location.href = `/reports?scanId=${e.target.value}`;
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm max-w-[240px]"
          >
            {runs.map((run) => {
              const proj = projectMap.get(run.project_id);
              return (
                <option key={run.id} value={run.id}>
                  {proj?.client_name} — {run.target_url}
                </option>
              );
            })}
          </select>
          <button
            onClick={() => {
              if (currentRun && currentProject) {
                downloadReportHTML(currentRun, currentProject, results);
                toast.success('HTML report downloaded!');
              } else {
                toast.error('No report selected');
              }
            }}
            className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export HTML
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Report document */}
      {currentRun && currentProject ? (
        <div className="rounded-lg border border-border bg-card p-6 md:p-8 lg:p-10 max-w-4xl mx-auto">
          {/* Report header */}
          <div className="border-b border-border pb-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold tracking-tight">SecScan PTaaS</span>
                </div>
                <h2 className="text-xl font-bold">Penetration Test Report</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentProject.client_name} — {currentRun.target_url}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground shrink-0" suppressHydrationWarning>
                <div>Report Date: {format(new Date(), 'MMM d, yyyy')}</div>
                <div>Scan ID: {currentRun.id.slice(0, 8)}</div>
                <div>Profile: <span className="capitalize">{currentRun.scan_profile}</span></div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <section className="mb-8 print-page">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Executive Summary</h3>
            <p className="text-sm text-foreground leading-relaxed mb-4" suppressHydrationWarning>
              A penetration test was conducted against <strong>{currentRun.target_url}</strong> for{' '}
              <strong>{currentProject.client_name}</strong> on{' '}
              {format(new Date(currentRun.created_at), 'MMMM d, yyyy')}. The assessment covered{' '}
              {currentRun.total_scenarios} security test scenarios across multiple categories
              including input handling, server security, authentication, session management, and
              business logic.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="rounded-md border border-error/20 bg-error/5 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <XCircle className="h-4 w-4 text-error" />
                  <span className="text-xs font-medium text-error">Vulnerable</span>
                </div>
                <div className="text-2xl font-bold text-error tabular-nums">{currentRun.vulnerable}</div>
              </div>
              <div className="rounded-md border border-warning/20 bg-warning/5 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-xs font-medium text-warning">Manual Review</span>
                </div>
                <div className="text-2xl font-bold text-warning tabular-nums">{currentRun.manual_review}</div>
              </div>
              <div className="rounded-md border border-success/20 bg-success/5 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-xs font-medium text-success">Passed</span>
                </div>
                <div className="text-2xl font-bold text-success tabular-nums">{currentRun.passed}</div>
              </div>
              <div className="rounded-md border border-border bg-secondary/20 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <ScanLine className="h-4 w-4 text-accent" />
                  <span className="text-xs font-medium text-accent">Total</span>
                </div>
                <div className="text-2xl font-bold text-accent tabular-nums">{currentRun.total_scenarios}</div>
              </div>
            </div>

            {currentRun.vulnerable > 0 ? (
              <div className="rounded-md border border-error/20 bg-error/5 p-4">
                <p className="text-sm text-foreground">
                  <strong className="text-error">Critical Finding:</strong> {currentRun.vulnerable} vulnerabilities
                  were identified during this assessment. The most severe findings should be remediated
                  immediately. Detailed findings and remediation recommendations are provided below.
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-success/20 bg-success/5 p-4">
                <p className="text-sm text-foreground">
                  <strong className="text-success">No critical vulnerabilities</strong> were detected by
                  automated scanning. {currentRun.manual_review} scenarios require manual verification.
                </p>
              </div>
            )}
          </section>

          {/* Vulnerability Findings */}
          {vulnerableResults.length > 0 && (
            <section className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Vulnerability Findings ({vulnerableResults.length})
              </h3>
              <div className="space-y-4">
                {vulnerableResults.map((result, idx) => (
                  <div key={result.id} className="rounded-md border border-border p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{result.scenario_code}</span>
                            {result.confidence_level && (
                              <span className={cn(
                                'px-1.5 py-0.5 rounded text-[10px] font-medium border uppercase',
                                CONFIDENCE_COLORS[result.confidence_level] || 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                              )} title="Confidence Level">
                                {result.confidence_level.slice(0, 3)}
                              </span>
                            )}
                            <span className={cn(
                              'px-1.5 py-0.5 rounded text-[10px] font-medium border',
                              SEVERITY_COLORS[result.severity]
                            )}>
                              {result.severity}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-foreground mt-0.5">{result.scenario_title}</h4>
                        </div>
                      </div>
                      {result.cvss_score > 0 && (
                        <div className="text-right shrink-0">
                          <div className="text-xs text-muted-foreground">CVSS</div>
                          <div className="text-sm font-bold tabular-nums">{result.cvss_score.toFixed(1)}</div>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">
                      <span className="font-medium">Category:</span> {result.category} ·{' '}
                      <span className="font-medium">Tool:</span> {result.tool_used}
                    </p>

                    {result.evidence_summary && (
                      <div className="mb-2">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Evidence</div>
                        <p className="text-xs text-muted-foreground bg-secondary/30 rounded p-2">{result.evidence_summary}</p>
                      </div>
                    )}

                    {result.remediation && (
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Remediation</div>
                        <p className="text-xs text-foreground bg-primary/5 border border-primary/10 rounded p-2">
                          {result.remediation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* False Positives */}
          {falsePositiveResults.length > 0 && (
            <section className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                False Positives ({falsePositiveResults.length})
              </h3>
              <div className="rounded-md border border-purple-500/20 bg-purple-500/5 p-4">
                <p className="text-xs text-muted-foreground mb-3">
                  The following findings were flagged by automated tools but have been manually marked as false positives. They do not pose a security risk.
                </p>
                <div className="space-y-2">
                  {falsePositiveResults.map((result) => (
                    <div key={result.id} className="flex items-start gap-3 text-xs">
                      <ShieldOff className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-muted-foreground">{result.scenario_code}</span>
                          <span className="font-semibold text-foreground">{result.scenario_title}</span>
                          {result.confidence_level && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium border uppercase bg-slate-500/10 text-slate-400 border-slate-500/30">
                              {result.confidence_level.slice(0, 3)} CONF
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground">{result.evidence_summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Manual Review Items */}
          {manualResults.length > 0 && (
            <section className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Manual Review Required ({manualResults.length})
              </h3>
              <div className="rounded-md border border-warning/20 bg-warning/5 p-4">
                <p className="text-xs text-muted-foreground mb-3">
                  The following scenarios require manual verification by a security analyst. These
                  scenarios involve business logic, financial operations, or compliance checks that
                  cannot be fully automated.
                </p>
                <div className="space-y-1.5">
                  {manualResults.map((result) => (
                    <div key={result.id} className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-muted-foreground shrink-0">{result.scenario_code}</span>
                      <span className="text-foreground">{result.scenario_title}</span>
                      <span className="text-muted-foreground">— {result.tool_used}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Scope & Authorization */}
          <section className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Scope & Authorization</h3>
            <div className="rounded-md border border-border p-4 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">Target:</span>
                <span className="font-mono">{currentRun.target_url}</span>
              </div>
              <div>
                <span className="font-medium">Client:</span> {currentProject.client_name} ({currentProject.target_domain})
              </div>
              <div>
                <span className="font-medium">Scan Profile:</span> <span className="capitalize">{currentRun.scan_profile}</span>
              </div>
              <div>
                <span className="font-medium">Assessment Date:</span> {format(new Date(currentRun.created_at), 'MMMM d, yyyy HH:mm')}
              </div>
              <div>
                <span className="font-medium">Consent Gate:</span> Verified — target was within an approved authorized scope before scan execution.
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-border pt-4 text-center text-[10px] text-muted-foreground">
            <p>
              This report was generated by SecScan PTaaS Platform on {format(new Date(), 'MMM d, yyyy HH:mm')}.
              Findings are based on automated and semi-automated testing. Manual review items require
              analyst verification. This document is confidential and intended for authorized personnel only.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Select a completed scan to view its report.</p>
        </div>
      )}
    </div>
  );
}
