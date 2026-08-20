import { supabase, type Project, type ScanRun } from '@/lib/supabase-client';
import { ProjectsList } from '@/components/projects/projects-list';
import { Plus, FolderKanban } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function ProjectsPage() {
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: runs } = await supabase
    .from('scan_runs')
    .select('id, project_id, status, vulnerable')
    .order('created_at', { ascending: false });

  const runMap = new Map<string, { total: number; vulns: number; running: number }>();
  if (runs) {
    for (const r of runs as Partial<ScanRun>[]) {
      const pid = r.project_id!;
      const existing = runMap.get(pid) || { total: 0, vulns: 0, running: 0 };
      existing.total++;
      if (r.vulnerable) existing.vulns += r.vulnerable;
      if (r.status === 'running' || r.status === 'queued') existing.running++;
      runMap.set(pid, existing);
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <FolderKanban className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground">Manage client engagements and authorized scopes</p>
          </div>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors glow-primary"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      <ProjectsList projects={(projects || []) as Project[]} runMap={runMap} />
    </div>
  );
}
