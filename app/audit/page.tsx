import { supabase, type ScanLog, type Project } from '@/lib/supabase-client';
import { ScrollText } from 'lucide-react';
import { format } from 'date-fns';

export const revalidate = 0;

export default async function AuditLogPage() {
  const { data: logs } = await supabase
    .from('scan_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  const projectIds = Array.from(new Set((logs || []).map((l: any) => l.project_id).filter(Boolean)));
  let projectMap: Map<string, Project> = new Map();
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, client_name, target_domain')
      .in('id', projectIds);
    projectMap = new Map((projects || []).map((p: any) => [p.id, p]));
  }

  const actionColors: Record<string, string> = {
    scan_initiated: 'text-accent',
    scan_started: 'text-accent',
    scan_completed: 'text-success',
    scan_blocked: 'text-error',
    scan_failed: 'text-error',
    scope_approved: 'text-success',
    scope_rejected: 'text-error',
    scope_revoked: 'text-warning',
    scope_added: 'text-accent',
    project_created: 'text-primary',
    project_updated: 'text-muted-foreground',
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <ScrollText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-sm text-muted-foreground">Immutable record of all platform actions for accountability</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {logs && logs.length > 0 ? (
          <div className="divide-y divide-border">
            {(logs as ScanLog[]).map((log) => {
              const project = log.project_id ? projectMap.get(log.project_id) : null;
              const actionColor = actionColors[log.action] || 'text-muted-foreground';
              return (
                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-secondary/20 transition-colors">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`h-2 w-2 rounded-full ${actionColor.replace('text-', 'bg-')}`} />
                    <div className="w-px h-full bg-border mt-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${actionColor}`}>{log.action.replace(/_/g, ' ')}</span>
                      {project && (
                        <span className="text-xs text-muted-foreground">· {project.client_name}</span>
                      )}
                    </div>
                    {log.target && (
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{log.target}</div>
                    )}
                    {log.detail && (
                      <div className="text-xs text-muted-foreground mt-1">{log.detail}</div>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground shrink-0" suppressHydrationWarning>
                    <div>{format(new Date(log.created_at), 'MMM d, yyyy')}</div>
                    <div>{format(new Date(log.created_at), 'HH:mm:ss')}</div>
                    <div className="mt-1 text-[10px]">by {log.actor}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ScrollText className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-sm font-semibold">No audit entries yet</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Actions like project creation, scope approval, and scan execution will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
