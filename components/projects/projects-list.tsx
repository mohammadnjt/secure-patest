'use client';

import Link from 'next/link';
import { type Project } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import { Globe, ShieldCheck, AlertCircle, ScanLine, ArrowRight, FolderKanban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type RunStats = { total: number; vulns: number; running: number };

const statusStyles: Record<string, string> = {
  active: 'bg-primary/10 text-primary border-primary/20',
  paused: 'bg-warning/10 text-warning border-warning/20',
  archived: 'bg-muted text-muted-foreground border-border',
};

export function ProjectsList({
  projects,
  runMap,
}: {
  projects: Project[];
  runMap: Map<string, RunStats>;
}) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/50 mb-4">
          <FolderKanban className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">No projects yet</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Create your first project to define a client engagement and authorize scan scopes.
        </p>
        <Link
          href="/projects/new"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Create Project
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((project) => {
        const stats = runMap.get(project.id) || { total: 0, vulns: 0, running: 0 };
        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/60">
                  <Globe className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.client_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{project.target_domain}</p>
                </div>
              </div>
              <span
                className={cn(
                  'shrink-0 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border',
                  statusStyles[project.status]
                )}
              >
                {project.status}
              </span>
            </div>

            {project.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                {project.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ScanLine className="h-3.5 w-3.5" />
                <span className="tabular-nums">{stats.total} scans</span>
              </div>
              {stats.vulns > 0 && (
                <div className="flex items-center gap-1.5 text-error">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span className="tabular-nums">{stats.vulns} vulns</span>
                </div>
              )}
              {stats.running > 0 && (
                <div className="flex items-center gap-1.5 text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <span>{stats.running} running</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className="text-[11px] text-muted-foreground" suppressHydrationWarning>
                {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
