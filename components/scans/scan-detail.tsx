'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { type ScanRun, type Project, type ScenarioResult } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import { STATUS_COLORS, SEVERITY_COLORS, CONFIDENCE_COLORS } from '@/lib/scenarios';
import {
  ArrowLeft, ScanLine, Globe, CheckCircle2, XCircle, AlertTriangle,
  Clock, Loader2, FileText, ChevronDown, ChevronRight, Filter,
  RefreshCw, Eye, Download, Bot, UserCog, Hand, ShieldOff,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';
import { downloadReportHTML } from '@/lib/export-html';
import { Button } from '@/components/ui/button';

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'info'];
const STATUS_ORDER = ['vulnerable', 'manual_review', 'fail', 'pass', 'pending', 'skipped'];

const EXEC_ICON: Record<string, typeof Bot> = {
  auto: Bot,
  'semi-auto': UserCog,
  manual: Hand,
};

export function ScanDetail({
  run,
  project,
  results,
}: {
  run: ScanRun;
  project: Project;
  results: ScenarioResult[];
}) {
  const router = useRouter();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(results.map((r) => r.category))).sort(),
    [results]
  );

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      return true;
    });
  }, [results, statusFilter, severityFilter, categoryFilter]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Updated');
    }, 800);
  };

  const isRunning = run.status === 'running' || run.status === 'queued';

  // Group results by category for summary
  const categoryStats = useMemo(() => {
    const map = new Map<string, { total: number; vuln: number; pass: number; manual: number }>();
    for (const r of results) {
      const existing = map.get(r.category) || { total: 0, vuln: 0, pass: 0, manual: 0 };
      existing.total++;
      if (r.status === 'vulnerable') existing.vuln++;
      if (r.status === 'pass') existing.pass++;
      if (r.status === 'manual_review') existing.manual++;
      map.set(r.category, existing);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].vuln - a[1].vuln);
  }, [results]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/scans" className="hover:text-foreground flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" /> Scans
        </Link>
        <span>/</span>
        <span className="text-foreground">{run.target_url}</span>
      </div>

      {/* Scan header */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl border',
              isRunning ? 'bg-accent/10 border-accent/20' : 'bg-primary/10 border-primary/20'
            )}>
              {isRunning ? (
                <Loader2 className="h-6 w-6 text-accent animate-spin" />
              ) : (
                <ScanLine className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight font-mono">{run.target_url}</h1>
                <span className={cn(
                  'shrink-0 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border',
                  STATUS_COLORS[run.status]
                )}>
                  {run.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Link href={`/projects/${project.id}`} className="text-sm text-primary hover:text-primary/80 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  {project.client_name}
                </Link>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground capitalize">{run.scan_profile} profile</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground" suppressHydrationWarning>{format(new Date(run.created_at), 'MMM d, yyyy HH:mm')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isRunning && (
              <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Refresh
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                downloadReportHTML(run, project, results);
                toast.success('HTML report generated and downloaded!');
              }}
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <Download className="h-3.5 w-3.5" />
              Export HTML
            </Button>
            {run.status === 'completed' && (
              <Link href={`/reports?scanId=${run.id}`}>
                <Button size="sm" variant="outline">
                  <FileText className="h-3.5 w-3.5" />
                  Report
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Progress bar for running scans */}
        {isRunning && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-accent flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                Executing scenarios...
              </span>
              <span className="text-muted-foreground tabular-nums">
                {results.length} / {run.total_scenarios || '?'} completed
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{
                  width: run.total_scenarios ? `${(results.length / run.total_scenarios) * 100}%` : '15%',
                }}
              />
            </div>
          </div>
        )}

        {/* Result summary stats */}
        {run.status === 'completed' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
            {[
              { label: 'Passed', value: run.passed, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
              { label: 'Vulnerable', value: run.vulnerable, icon: XCircle, color: 'text-error', bg: 'bg-error/10' },
              { label: 'Manual Review', value: run.manual_review, icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
              { label: 'Failed', value: run.failed, icon: XCircle, color: 'text-muted-foreground', bg: 'bg-muted' },
              { label: 'Total', value: run.total_scenarios, icon: ScanLine, color: 'text-accent', bg: 'bg-accent/10' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-md border border-border bg-secondary/20 p-3">
                  <div className={cn('flex h-7 w-7 items-center justify-center rounded-md mb-2', stat.bg)}>
                    <Icon className={cn('h-3.5 w-3.5', stat.color)} />
                  </div>
                  <div className="text-xl font-bold tabular-nums">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category summary */}
      {results.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Category Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {categoryStats.map(([category, stats]) => (
              <div key={category} className="flex items-center gap-3 rounded-md border border-border bg-secondary/20 px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{category}</div>
                  <div className="text-[10px] text-muted-foreground">{stats.total} scenarios</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {stats.vuln > 0 && (
                    <span className="flex items-center gap-1 text-xs text-error" title="Vulnerable">
                      <XCircle className="h-3 w-3" />
                      <span className="tabular-nums">{stats.vuln}</span>
                    </span>
                  )}
                  {stats.manual > 0 && (
                    <span className="flex items-center gap-1 text-xs text-warning" title="Manual Review">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="tabular-nums">{stats.manual}</span>
                    </span>
                  )}
                  {stats.pass > 0 && (
                    <span className="flex items-center gap-1 text-xs text-success" title="Passed">
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="tabular-nums">{stats.pass}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters + Results */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-border">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Results</span>
            <span className="text-xs text-muted-foreground">({filteredResults.length})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="vulnerable">Vulnerable</option>
              <option value="manual_review">Manual Review</option>
              <option value="pass">Passed</option>
              <option value="fail">Failed</option>
              <option value="false_positive">False Positive</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs max-w-[160px]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {results.length === 0 ? (
              <>
                <Clock className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {isRunning ? 'Scenarios are executing. Results will appear here shortly.' : 'No results yet.'}
                </p>
                {isRunning && (
                  <Button size="sm" variant="outline" className="mt-3" onClick={handleRefresh}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </Button>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No results match the selected filters.</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredResults.map((result) => {
              const isExpanded = expandedRows.has(result.id);
              const ExecIcon = EXEC_ICON[result.execution_type] || Bot;
              return (
                <div key={result.id}>
                  <button
                    onClick={() => toggleRow(result.id)}
                    className="flex items-center gap-3 w-full p-3 hover:bg-secondary/20 transition-colors text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}

                    <div className="flex h-7 w-12 shrink-0 items-center justify-center rounded text-[10px] font-mono font-medium border border-border bg-secondary/30">
                      {result.scenario_code.replace('SCN-', '')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{result.scenario_title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground truncate">{result.category}</span>
                        <ExecIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-[10px] text-muted-foreground capitalize shrink-0">{result.execution_type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {result.confidence_level && (
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-medium border uppercase',
                          CONFIDENCE_COLORS[result.confidence_level] || 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        )} title="Confidence Level">
                          {result.confidence_level.slice(0, 3)}
                        </span>
                      )}
                      {result.status === 'vulnerable' && (
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-medium border',
                          SEVERITY_COLORS[result.severity]
                        )}>
                          {result.severity}
                        </span>
                      )}
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border',
                        STATUS_COLORS[result.status]
                      )}>
                        {result.status.replace('_', ' ')}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-secondary/10 animate-fade-in">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ml-7">
                        {/* Evidence */}
                        {result.evidence_summary && (
                          <div className="rounded-md border border-border bg-card p-3">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Eye className="h-3.5 w-3.5 text-accent" />
                              <span className="text-xs font-semibold">Evidence Summary</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{result.evidence_summary}</p>
                            {result.tool_used && (
                              <div className="mt-2 text-[11px] text-muted-foreground">
                                <span className="font-medium">Tool:</span> {result.tool_used}
                              </div>
                            )}
                            {result.cvss_score > 0 && (
                              <div className="mt-1 text-[11px] text-muted-foreground">
                                <span className="font-medium">CVSS:</span> {result.cvss_score.toFixed(1)}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Remediation */}
                        {result.remediation && (
                          <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                            <div className="flex items-center gap-1.5 mb-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs font-semibold text-primary">Remediation</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{result.remediation}</p>
                          </div>
                        )}

                        {/* Request/Response */}
                        {result.request_data && (
                          <div className="rounded-md border border-border bg-zinc-950/50 p-3 lg:col-span-2">
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className="text-xs font-semibold text-muted-foreground">Request / Response Evidence</span>
                            </div>
                            <pre className="text-[11px] text-muted-foreground font-mono whitespace-pre-wrap break-all">
                              {result.request_data}
                              {'\n--- Response ---\n'}
                              {result.response_data}
                            </pre>
                          </div>
                        )}

                        {/* Manual review placeholder */}
                        {result.status === 'manual_review' && (
                          <div className="rounded-md border border-warning/20 bg-warning/5 p-3 lg:col-span-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                                <span className="text-xs font-semibold text-warning">Manual Review Required</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              This scenario requires human verification. Use the referenced tool to manually test and update the result.
                              {result.tool_used && ` Recommended tool: ${result.tool_used}.`}
                            </p>
                          </div>
                        )}

                        {/* Actions (False Positive) */}
                        {result.status === 'vulnerable' && (
                          <div className="lg:col-span-2 flex justify-end">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await supabase.from('scenario_results').update({ status: 'false_positive' }).eq('id', result.id);
                                  toast.success('Marked as false positive');
                                  router.refresh();
                                } catch (err) {
                                  toast.error('Failed to update result');
                                }
                              }}
                            >
                              <ShieldOff className="h-3.5 w-3.5 mr-1.5" />
                              Mark as False Positive
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
