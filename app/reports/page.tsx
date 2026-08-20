import { supabase, type ScanRun, type Project, type ScenarioResult } from '@/lib/supabase-client';
import { ReportView } from '@/components/reports/report-view';

export const revalidate = 0;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { scanId?: string };
}) {
  const { data: runs } = await supabase
    .from('scan_runs')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  const runIds = (runs || []).map((r: any) => r.id);

  let projectMap: Map<string, Project> = new Map();
  let selectedRun: ScanRun | null = null;
  let results: ScenarioResult[] = [];
  let project: Project | null = null;

  if (runs && runs.length > 0) {
    const projectIds = Array.from(new Set((runs as any[]).map((r) => r.project_id)));
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds);
    projectMap = new Map((projects || []).map((p: any) => [p.id, p as Project]));

    const selectedId = searchParams.scanId || (runs[0] as any).id;
    selectedRun = (runs as ScanRun[]).find((r) => r.id === selectedId) || null;

    if (selectedRun) {
      project = projectMap.get(selectedRun.project_id) || null;
      const { data: resultData } = await supabase
        .from('scenario_results')
        .select('*')
        .eq('scan_run_id', selectedRun.id)
        .order('severity', { ascending: false })
        .order('scenario_code', { ascending: true });
      results = (resultData || []) as ScenarioResult[];
    }
  }

  return (
    <ReportView
      runs={(runs || []) as ScanRun[]}
      selectedRun={selectedRun}
      project={project}
      results={results}
      projectMap={projectMap}
      defaultScanId={searchParams.scanId}
    />
  );
}
