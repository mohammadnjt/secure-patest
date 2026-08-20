'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type Project, type AuthorizedScope } from '@/lib/supabase-client';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Loader2, Play, ShieldCheck, ShieldAlert, Info } from 'lucide-react';

const SCAN_PROFILES = [
  { value: 'recon', label: 'Recon Only', desc: 'Subdomain, robots.txt, headers, tech fingerprint' },
  { value: 'passive', label: 'Passive Scan', desc: 'Security headers, TLS config, exposed files — no active attacks' },
  { value: 'active', label: 'Active Scan', desc: 'SQLi/XSS/SSRF/CSRF via Nuclei/ZAP — sends test payloads' },
  { value: 'full', label: 'Full Assessment', desc: 'All 101 scenarios including JWT, session, rate-limit tests' },
  { value: 'custom', label: 'Custom', desc: 'Select specific scenario categories (coming soon)' },
] as const;

export function NewScanForm({
  projects,
  scopes,
  preselectedProject,
}: {
  projects: Project[];
  scopes: AuthorizedScope[];
  preselectedProject: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Default initial project selection
  const initialProjId = preselectedProject || (projects.length > 0 ? projects[0].id : '');
  const [selectedProject, setSelectedProject] = useState(initialProjId);

  // Filter scopes for selected project
  const projectScopes = scopes.filter((s) => s.project_id === selectedProject);

  // Default scope selection
  const initialScopeId = projectScopes.length > 0 ? projectScopes[0].id : '';
  const [selectedScope, setSelectedScope] = useState(initialScopeId);

  // Default target URL
  const initialScopeObj = projectScopes.find((s) => s.id === initialScopeId);
  const initialProjectObj = projects.find((p) => p.id === initialProjId);
  const defaultHost = initialScopeObj
    ? initialScopeObj.host_pattern.replace(/^\*\./, '')
    : initialProjectObj?.target_domain || '';
  const [targetUrl, setTargetUrl] = useState(defaultHost ? `https://${defaultHost}` : '');

  const [scanProfile, setScanProfile] = useState<string>('full');
  const [stagingOnly, setStagingOnly] = useState(true);

  // Sync defaults if project changes
  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    const pScopes = scopes.filter((s) => s.project_id === projectId);
    const firstScope = pScopes[0];
    if (firstScope) {
      setSelectedScope(firstScope.id);
      const host = firstScope.host_pattern.replace(/^\*\./, '');
      setTargetUrl(`https://${host}`);
    } else {
      setSelectedScope('');
      const proj = projects.find((p) => p.id === projectId);
      if (proj) setTargetUrl(`https://${proj.target_domain}`);
      else setTargetUrl('');
    }
  };

  const handleScopeChange = (scopeId: string) => {
    setSelectedScope(scopeId);
    const scope = projectScopes.find((s) => s.id === scopeId);
    if (scope) {
      const host = scope.host_pattern.replace(/^\*\./, '');
      setTargetUrl(`https://${host}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedScope || !targetUrl.trim()) {
      toast.error('Please select a project, an approved scope, and a target URL');
      return;
    }

    const isStagingSensitive = scanProfile === 'active' || scanProfile === 'full';
    if (isStagingSensitive && !stagingOnly) {
      toast.error('Active and full scans must acknowledge the staging-only safety confirmation');
      return;
    }

    setLoading(true);
    try {
      const { data: run, error: runErr } = await supabase
        .from('scan_runs')
        .insert({
          project_id: selectedProject,
          scope_id: selectedScope,
          target_url: targetUrl.trim(),
          scan_profile: scanProfile,
          status: 'queued',
        })
        .select()
        .single();

      if (runErr) throw runErr;

      const runId = run?.id || `scan-${Date.now()}`;

      await supabase.from('scan_logs').insert({
        scan_run_id: runId,
        project_id: selectedProject,
        actor: 'Security Officer',
        action: 'scan_initiated',
        target: targetUrl.trim(),
        detail: `Scan initiated with profile: ${scanProfile}`,
      });

      // Trigger asynchronous edge function if available
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      if (supabaseUrl && anonKey) {
        fetch(`${supabaseUrl}/functions/v1/run-scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ scanRunId: runId, scanProfile }),
        }).catch(() => {});
      }

      toast.success('Scan launched successfully — redirecting to results');
      window.location.href = `/scans/${runId}`;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create scan run');
      setLoading(false);
    }
  };

  if (projects.length === 0 || scopes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
        <ShieldAlert className="h-10 w-10 text-warning/50 mx-auto mb-3" />
        <h3 className="text-sm font-semibold">No authorized scopes available</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          You need at least one active project with an approved scope entry before you can launch a scan.
          Create a project and approve its scope to continue.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-border bg-card p-6">
      {/* Project selection */}
      <div className="space-y-2">
        <Label>Project</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {projects.map((project) => {
            const hasScope = scopes.some((s) => s.project_id === project.id);
            const selected = selectedProject === project.id;
            return (
              <button
                key={project.id}
                type="button"
                disabled={!hasScope}
                onClick={() => handleProjectChange(project.id)}
                className={cn(
                  'flex items-center gap-3 rounded-md border p-3 text-left transition-all',
                  selected
                    ? 'border-primary bg-primary/10'
                    : hasScope
                    ? 'border-border bg-secondary/30 hover:border-primary/30'
                    : 'border-border bg-secondary/20 opacity-50 cursor-not-allowed'
                )}
              >
                <ShieldCheck className={cn('h-4 w-4 shrink-0', selected ? 'text-primary' : 'text-muted-foreground')} />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{project.client_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{project.target_domain}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scope selection */}
      {selectedProject && projectScopes.length > 0 && (
        <div className="space-y-2">
          <Label>Authorized Scope</Label>
          <div className="space-y-2">
            {projectScopes.map((scope) => {
              const selected = selectedScope === scope.id;
              return (
                <button
                  key={scope.id}
                  type="button"
                  onClick={() => handleScopeChange(scope.id)}
                  className={cn(
                    'flex items-center gap-3 w-full rounded-md border p-3 text-left transition-all',
                    selected ? 'border-primary bg-primary/10' : 'border-border bg-secondary/30 hover:border-primary/30'
                  )}
                >
                  <ShieldCheck className={cn('h-4 w-4 shrink-0', selected ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono text-foreground">{scope.host_pattern}</div>
                    <div className="text-xs text-muted-foreground">
                      {scope.scope_type} · approved by {scope.authorized_by || 'admin'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Target URL */}
      <div className="space-y-2">
        <Label htmlFor="target_url">Target URL</Label>
        <Input
          id="target_url"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="https://target.example.com"
          className="font-mono"
          required
        />
        <p className="text-xs text-muted-foreground">
          The URL must match or fall within the selected authorized scope.
        </p>
      </div>

      {/* Scan profile */}
      <div className="space-y-2">
        <Label>Scan Profile</Label>
        <div className="space-y-2">
          {SCAN_PROFILES.map((profile) => {
            const selected = scanProfile === profile.value;
            return (
              <button
                key={profile.value}
                type="button"
                onClick={() => setScanProfile(profile.value)}
                disabled={profile.value === 'custom'}
                className={cn(
                  'flex items-start gap-3 w-full rounded-md border p-3 text-left transition-all',
                  selected ? 'border-primary bg-primary/10' : 'border-border bg-secondary/30 hover:border-primary/30',
                  profile.value === 'custom' && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'flex h-4 w-4 mt-0.5 shrink-0 items-center justify-center rounded-full border',
                  selected ? 'border-primary bg-primary' : 'border-border'
                )}>
                  {selected && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{profile.label}</div>
                  <div className="text-xs text-muted-foreground">{profile.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Staging confirmation */}
      {(scanProfile === 'active' || scanProfile === 'full') && (
        <div className="rounded-md border border-warning/30 bg-warning/5 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">Safety Confirmation Required</p>
              <p className="text-xs text-muted-foreground mt-1">
                Active and full scan profiles send test payloads to the target. Race condition and
                double-spending tests must only run against staging environments, never production.
                Confirm that the target is a staging or authorized testing environment.
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={stagingOnly}
              onChange={(e) => setStagingOnly(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-warning"
            />
            <span className="text-foreground">
              I confirm this target is a staging/authorized testing environment
            </span>
          </label>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.push('/scans')} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Launch Scan
        </Button>
      </div>
    </form>
  );
}
