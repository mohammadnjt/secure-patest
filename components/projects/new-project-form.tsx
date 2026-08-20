'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

export function NewProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    client_name: '',
    target_domain: '',
    description: '',
    scope_host: '',
    scope_type: 'domain' as 'domain' | 'subdomain' | 'ip' | 'url' | 'wildcard',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name.trim() || !form.target_domain.trim()) {
      toast.error('Client name and target domain are required');
      return;
    }

    setLoading(true);
    try {
      const { data: project, error: projErr } = await supabase
        .from('projects')
        .insert({
          client_name: form.client_name.trim(),
          target_domain: form.target_domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''),
          description: form.description.trim() || null,
        })
        .select()
        .single();

      if (projErr) throw projErr;

      // Auto-create initial scope entry (pending approval)
      if (form.scope_host.trim() && project) {
        const { error: scopeErr } = await supabase.from('authorized_scopes').insert({
          project_id: project.id,
          host_pattern: form.scope_host.trim(),
          scope_type: form.scope_type,
          status: 'pending',
        });
        if (scopeErr) throw scopeErr;
      }

      // Log
      await supabase.from('scan_logs').insert({
        project_id: project.id,
        actor: 'Security Officer',
        action: 'project_created',
        target: form.target_domain,
        detail: `Project "${form.client_name}" created`,
      });

      toast.success('Project created successfully');
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-border bg-card p-6">
      <div className="space-y-2">
        <Label htmlFor="client_name">Client Name</Label>
        <Input
          id="client_name"
          value={form.client_name}
          onChange={(e) => setForm({ ...form, client_name: e.target.value })}
          placeholder="e.g. Mozafargold"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_domain">Target Domain</Label>
        <Input
          id="target_domain"
          value={form.target_domain}
          onChange={(e) => setForm({ ...form, target_domain: e.target.value })}
          placeholder="e.g. mozafargold.ir"
          required
        />
        <p className="text-xs text-muted-foreground">
          The base domain for this engagement. Do not include http:// or https://
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description of the engagement..."
          rows={3}
        />
      </div>

      <div className="border-t border-border pt-5 space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-1">Initial Scope Entry</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Define the first authorized target. This will be created with &quot;pending&quot; status
            and must be approved before any scans can run.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="scope_host">Host / Pattern</Label>
            <Input
              id="scope_host"
              value={form.scope_host}
              onChange={(e) => setForm({ ...form, scope_host: e.target.value })}
              placeholder="e.g. *.mozafargold.ir"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scope_type">Scope Type</Label>
            <select
              id="scope_type"
              value={form.scope_type}
              onChange={(e) => setForm({ ...form, scope_type: e.target.value as any })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="domain">Domain</option>
              <option value="subdomain">Subdomain</option>
              <option value="wildcard">Wildcard</option>
              <option value="ip">IP Address</option>
              <option value="url">Specific URL</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/projects')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Create Project
        </Button>
      </div>
    </form>
  );
}
