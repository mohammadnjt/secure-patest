import { supabase, type ScanRun, type Project, type ScenarioResult } from '@/lib/supabase-client';
import { ScanDetail } from '@/components/scans/scan-detail';
import { notFound } from 'next/navigation';

export const revalidate = 0;

export default async function ScanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: run } = await supabase
    .from('scan_runs')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!run) notFound();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', run.project_id)
    .maybeSingle();

  const { data: results } = await supabase
    .from('scenario_results')
    .select('*')
    .eq('scan_run_id', params.id)
    .order('severity', { ascending: false })
    .order('scenario_code', { ascending: true });

  const fallbackProject: Project = (project as Project) || {
    id: run.project_id || 'proj-1',
    client_name: 'Target Client',
    target_domain: run.target_url ? run.target_url.replace(/^https?:\/\//, '') : 'target.com',
    description: 'Target project',
    status: 'active',
    created_at: run.created_at || new Date().toISOString(),
    updated_at: run.created_at || new Date().toISOString(),
  };

  return (
    <ScanDetail
      run={run as ScanRun}
      project={fallbackProject}
      results={(results || []) as ScenarioResult[]}
    />
  );
}
