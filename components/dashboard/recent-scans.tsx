'use client';

import Link from 'next/link';
import { type ScanRun, type Project } from '@/lib/supabase-client';
import { STATUS_COLORS } from '@/lib/scenarios';
import { cn } from '@/lib/utils';
import { ScanLine, ArrowRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function RecentScans({ runs, projects }: { runs: ScanRun[]; projects: Project[] }) {
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Recent Scan Runs</h3>
        </div>
        <Link
          href="/scans"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ScanLine className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No scans have been run yet.</p>
          <Link href="/projects" className="mt-3 text-xs text-primary hover:text-primary/80">
            Create a project to get started
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {runs.slice(0, 6).map((run) => {
            const project = projectMap.get(run.project_id);
            return (
              <Link
                key={run.id}
                href={`/scans/${run.id}`}
                className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {project?.client_name || 'Unknown'}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border',
                        STATUS_COLORS[run.status]
                      )}
                    >
                      {run.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="truncate">{run.target_url}</span>
                    <span className="shrink-0">·</span>
                    <span className="shrink-0 flex items-center gap-1" suppressHydrationWarning>
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  {run.vulnerable > 0 && (
                    <span className="flex items-center gap-1 text-xs">
                      <span className="h-2 w-2 rounded-full bg-error" />
                      <span className="text-error font-medium tabular-nums">{run.vulnerable}</span>
                    </span>
                  )}
                  {run.passed > 0 && (
                    <span className="flex items-center gap-1 text-xs">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-success font-medium tabular-nums">{run.passed}</span>
                    </span>
                  )}
                  {run.manual_review > 0 && (
                    <span className="flex items-center gap-1 text-xs">
                      <span className="h-2 w-2 rounded-full bg-warning" />
                      <span className="text-warning font-medium tabular-nums">{run.manual_review}</span>
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
