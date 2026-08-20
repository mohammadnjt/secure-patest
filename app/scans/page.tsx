import { supabase, type ScanRun, type Project } from '@/lib/supabase-client';
import { ScansList } from '@/components/scans/scans-list';
import { ScanLine } from 'lucide-react';

export const revalidate = 0;

export default async function ScansPage() {
  const [runsResult, projectsResult] = await Promise.all([
    supabase
      .from('scan_runs')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('projects')
      .select('id, client_name, target_domain')
      .order('created_at', { ascending: false }),
  ]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
          <ScanLine className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scan Runs</h1>
          <p className="text-sm text-muted-foreground">All penetration test executions across projects</p>
        </div>
      </div>

      <ScansList
        runs={(runsResult.data || []) as ScanRun[]}
        projects={(projectsResult.data || []) as Project[]}
      />
    </div>
  );
}
