import { supabase, type ScanRun, type Project } from '@/lib/supabase-client';
import { SCENARIOS } from '@/lib/scenarios';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { SeverityChart } from '@/components/dashboard/severity-chart';
import { ScenarioCoverage } from '@/components/dashboard/scenario-coverage';
import { RecentScans } from '@/components/dashboard/recent-scans';
import { ScopeGateAlert } from '@/components/dashboard/scope-gate-alert';
import { ShieldCheck, ScanLine, AlertCircle, CheckCircle2, FileWarning } from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage() {
  const [runsResult, projectsResult] = await Promise.all([
    supabase
      .from('scan_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  const runs = (runsResult.data || []) as ScanRun[];
  const projects = (projectsResult.data || []) as Project[];

  const totalScans = runs.length;
  const completedScans = runs.filter((r) => r.status === 'completed').length;
  const totalVulns = runs.reduce((sum, r) => sum + (r.vulnerable || 0), 0);
  const totalManual = runs.reduce((sum, r) => sum + (r.manual_review || 0), 0);
  const totalPassed = runs.reduce((sum, r) => sum + (r.passed || 0), 0);
  const activeProjects = projects.filter((p) => p.status === 'active').length;

  // Aggregate severity counts across all completed runs
  let severityCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  if (totalScans > 0) {
    const { data: results } = await supabase
      .from('scenario_results')
      .select('severity')
      .in(
        'scan_run_id',
        runs.map((r) => r.id)
      )
      .eq('status', 'vulnerable');
    if (results) {
      for (const r of results) {
        const sev = r.severity as keyof typeof severityCounts;
        if (sev in severityCounts) severityCounts[sev]++;
      }
    }
  }

  const stats = [
    {
      label: 'Total Scans',
      value: totalScans,
      iconKey: 'scan',
      color: 'text-accent',
      bg: 'bg-accent/10',
      border: 'border-accent/20',
    },
    {
      label: 'Active Projects',
      value: activeProjects,
      iconKey: 'shield',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
    },
    {
      label: 'Vulnerabilities Found',
      value: totalVulns,
      iconKey: 'alert',
      color: 'text-error',
      bg: 'bg-error/10',
      border: 'border-error/20',
    },
    {
      label: 'Scenarios Passed',
      value: totalPassed,
      iconKey: 'check',
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/20',
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of penetration testing operations and findings
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
          <FileWarning className="h-4 w-4 text-warning" />
          <span className="text-xs text-muted-foreground">
            {SCENARIOS.length} scenarios across {new Set(SCENARIOS.map((s) => s.category)).size} categories
          </span>
        </div>
      </div>

      <ScopeGateAlert />

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SeverityChart severityCounts={severityCounts} />
        <ScenarioCoverage />
      </div>

      <RecentScans runs={runs} projects={projects} />
    </div>
  );
}
