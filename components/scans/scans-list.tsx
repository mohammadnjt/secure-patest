'use client';

import Link from 'next/link';
import { type ScanRun, type Project } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import { STATUS_COLORS } from '@/lib/scenarios';
import { ScanLine, ArrowRight, Plus, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ScansList({ runs, projects }: { runs: ScanRun[]; projects: Project[] }) {
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href="/scans/new"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors glow-accent"
        >
          <Plus className="h-4 w-4" />
          New Scan
        </Link>
      </div>

      {runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-16 text-center">
          <ScanLine className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-sm font-semibold">No scans yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Start a new scan from any project with an approved scope.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wider px-4 py-3">Client</th>
                  <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wider px-4 py-3">Target</th>
                  <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Profile</th>
                  <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-center font-medium text-xs text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Results</th>
                  <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Created</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {runs.map((run) => {
                  const project = projectMap.get(run.project_id);
                  return (
                    <tr key={run.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/projects/${run.project_id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                          {project?.client_name || 'Unknown'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs truncate max-w-[200px]">
                        {run.target_url}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground capitalize hidden md:table-cell">
                        {run.scan_profile}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border',
                          STATUS_COLORS[run.status]
                        )}>
                          {run.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-2.5 text-xs">
                          {run.vulnerable > 0 && (
                            <span className="flex items-center gap-1 text-error" title="Vulnerable">
                              <XCircle className="h-3.5 w-3.5" />
                              <span className="tabular-nums">{run.vulnerable}</span>
                            </span>
                          )}
                          {run.manual_review > 0 && (
                            <span className="flex items-center gap-1 text-warning" title="Manual Review">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span className="tabular-nums">{run.manual_review}</span>
                            </span>
                          )}
                          {run.passed > 0 && (
                            <span className="flex items-center gap-1 text-success" title="Passed">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span className="tabular-nums">{run.passed}</span>
                            </span>
                          )}
                          {run.pending > 0 && (
                            <span className="flex items-center gap-1 text-muted-foreground" title="Pending">
                              <Clock className="h-3.5 w-3.5" />
                              <span className="tabular-nums">{run.pending}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell" suppressHydrationWarning>
                        {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/scans/${run.id}`}>
                          <ArrowRight className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
