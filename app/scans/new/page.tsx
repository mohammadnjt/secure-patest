import { supabase, type Project, type AuthorizedScope } from '@/lib/supabase-client';
import { NewScanForm } from '@/components/scans/new-scan-form';
import { ArrowLeft, ScanLine } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function NewScanPage({
  searchParams,
}: {
  searchParams: { projectId?: string };
}) {
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Get all approved scopes for these projects
  const projectIds = (projects || []).map((p: any) => p.id);
  let scopes: any[] = [];
  if (projectIds.length > 0) {
    const { data: scopeData } = await supabase
      .from('authorized_scopes')
      .select('*')
      .in('project_id', projectIds)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    scopes = scopeData || [];
  }

  const preselectedProject = searchParams.projectId || '';

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in max-w-2xl">
      <Link
        href="/scans"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Scans
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
          <ScanLine className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Scan Run</h1>
          <p className="text-sm text-muted-foreground">Launch a penetration test against an authorized target</p>
        </div>
      </div>

      <NewScanForm
        projects={(projects || []) as Project[]}
        scopes={scopes as AuthorizedScope[]}
        preselectedProject={preselectedProject}
      />
    </div>
  );
}
