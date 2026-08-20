import { supabase, type Project, type AuthorizedScope, type ScanRun } from '@/lib/supabase-client';
import { ProjectDetail } from '@/components/projects/project-detail';
import { notFound } from 'next/navigation';

export const revalidate = 0;

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!project) notFound();

  const { data: scopes } = await supabase
    .from('authorized_scopes')
    .select('*')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false });

  const { data: runs } = await supabase
    .from('scan_runs')
    .select('*')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <ProjectDetail
      project={project as Project}
      scopes={(scopes || []) as AuthorizedScope[]}
      runs={(runs || []) as ScanRun[]}
    />
  );
}
