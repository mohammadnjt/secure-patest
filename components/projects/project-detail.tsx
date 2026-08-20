'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Project, type AuthorizedScope, type ScanRun } from '@/lib/supabase-client';
import { supabase } from '@/lib/supabase-client';
import { ScopeManager } from '@/components/projects/scope-manager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { STATUS_COLORS } from '@/lib/scenarios';
import {
  ArrowLeft, Globe, ShieldCheck, Plus, ScanLine, ArrowRight,
  CheckCircle2, XCircle, Clock, Loader2, Save, Pencil, X,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export function ProjectDetail({
  project,
  scopes,
  runs,
}: {
  project: Project;
  scopes: AuthorizedScope[];
  runs: ScanRun[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    client_name: project.client_name,
    description: project.description || '',
    status: project.status,
  });

  const approvedScopes = scopes.filter((s) => s.status === 'approved');
  const hasApprovedScope = approvedScopes.length > 0;

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          client_name: form.client_name,
          description: form.description || null,
          status: form.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id);

      if (error) throw error;
      toast.success('Project updated');
      setEditing(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Projects
      </Link>

      {/* Project header */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{project.client_name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{project.target_domain}</p>
              <p className="text-xs text-muted-foreground mt-2" suppressHydrationWarning>
                Created {format(new Date(project.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
                <Button size="sm" onClick={handleSave} disabled={loading}>
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Client Name</Label>
              <Input
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                className="max-w-md"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="max-w-md"
              />
            </div>
          </div>
        ) : (
          project.description && (
            <p className="mt-4 text-sm text-muted-foreground max-w-2xl">{project.description}</p>
          )
        )}

        {/* Scope gate indicator */}
        <div className={cn(
          'mt-4 flex items-center gap-2 rounded-md px-3 py-2 text-xs',
          hasApprovedScope
            ? 'bg-primary/10 text-primary'
            : 'bg-warning/10 text-warning'
        )}>
          {hasApprovedScope ? (
            <>
              <ShieldCheck className="h-4 w-4" />
              {approvedScopes.length} approved scope(s) — scans can be initiated
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              No approved scopes — approve a scope entry to enable scanning
            </>
          )}
        </div>
      </div>

      {/* Scope manager */}
      <ScopeManager project={project} scopes={scopes} />

      {/* Scan runs */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">Scan Runs</h3>
            <span className="text-xs text-muted-foreground">({runs.length})</span>
          </div>
          {hasApprovedScope && (
            <Link
              href={`/scans/new?projectId=${project.id}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 border border-accent/20 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Scan
            </Link>
          )}
        </div>

        {runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ScanLine className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No scans run for this project yet.</p>
            {hasApprovedScope && (
              <Link
                href={`/scans/new?projectId=${project.id}`}
                className="mt-3 text-xs text-accent hover:text-accent/80"
              >
                Start your first scan
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {runs.map((run) => (
              <Link
                key={run.id}
                href={`/scans/${run.id}`}
                className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{run.target_url}</span>
                    <span className={cn(
                      'shrink-0 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border',
                      STATUS_COLORS[run.status]
                    )}>
                      {run.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="capitalize">{run.scan_profile} profile</span>
                    <span>·</span>
                    <span suppressHydrationWarning>{formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  {run.vulnerable > 0 && (
                    <span className="flex items-center gap-1 text-xs text-error">
                      <XCircle className="h-3.5 w-3.5" />
                      <span className="tabular-nums">{run.vulnerable}</span>
                    </span>
                  )}
                  {run.passed > 0 && (
                    <span className="flex items-center gap-1 text-xs text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="tabular-nums">{run.passed}</span>
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
