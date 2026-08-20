'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Project, type AuthorizedScope } from '@/lib/supabase-client';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  ShieldCheck, ShieldAlert, Plus, Check, X, Clock, Loader2,
  Ban, FileCheck,
} from 'lucide-react';
import { format } from 'date-fns';

const scopeStatusConfig = {
  approved: { icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', label: 'Approved' },
  pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', label: 'Pending' },
  rejected: { icon: X, color: 'text-error', bg: 'bg-error/10', border: 'border-error/20', label: 'Rejected' },
  revoked: { icon: Ban, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', label: 'Revoked' },
};

export function ScopeManager({ project, scopes }: { project: Project; scopes: AuthorizedScope[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newScope, setNewScope] = useState({
    host_pattern: '',
    scope_type: 'domain' as 'domain' | 'subdomain' | 'ip' | 'url' | 'wildcard',
    consent_document: '',
    notes: '',
  });

  const updateScopeStatus = async (scopeId: string, status: 'approved' | 'rejected' | 'revoked') => {
    setLoading(scopeId);
    try {
      const updates: any = { status };
      if (status === 'approved') {
        updates.authorized_by = 'Security Officer';
        updates.authorized_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('authorized_scopes')
        .update(updates)
        .eq('id', scopeId);

      if (error) throw error;

      // Log
      await supabase.from('scan_logs').insert({
        project_id: project.id,
        actor: 'Security Officer',
        action: `scope_${status}`,
        target: scopes.find((s) => s.id === scopeId)?.host_pattern,
        detail: `Scope ${status}`,
      });

      toast.success(`Scope ${status}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update scope');
    } finally {
      setLoading(null);
    }
  };

  const handleAddScope = async () => {
    if (!newScope.host_pattern.trim()) {
      toast.error('Host pattern is required');
      return;
    }
    setLoading('add');
    try {
      const { error } = await supabase.from('authorized_scopes').insert({
        project_id: project.id,
        host_pattern: newScope.host_pattern.trim(),
        scope_type: newScope.scope_type,
        status: 'pending',
        consent_document: newScope.consent_document.trim() || null,
        notes: newScope.notes.trim() || null,
      });

      if (error) throw error;

      await supabase.from('scan_logs').insert({
        project_id: project.id,
        actor: 'Security Officer',
        action: 'scope_added',
        target: newScope.host_pattern,
        detail: 'New scope entry added (pending approval)',
      });

      toast.success('Scope entry added (pending approval)');
      setNewScope({ host_pattern: '', scope_type: 'domain', consent_document: '', notes: '' });
      setShowAdd(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add scope');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-warning" />
          <h3 className="text-sm font-semibold">Authorized Scopes</h3>
          <span className="text-xs text-muted-foreground">({scopes.length})</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-3.5 w-3.5" />
          Add Scope
        </Button>
      </div>

      {showAdd && (
        <div className="p-5 border-b border-border bg-secondary/20 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs">Host Pattern</Label>
              <Input
                value={newScope.host_pattern}
                onChange={(e) => setNewScope({ ...newScope, host_pattern: e.target.value })}
                placeholder="e.g. *.mozafargold.ir or api.mozafargold.ir"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <select
                value={newScope.scope_type}
                onChange={(e) => setNewScope({ ...newScope, scope_type: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="domain">Domain</option>
                <option value="subdomain">Subdomain</option>
                <option value="wildcard">Wildcard</option>
                <option value="ip">IP Address</option>
                <option value="url">Specific URL</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Consent Document Reference (Optional)</Label>
              <Input
                value={newScope.consent_document}
                onChange={(e) => setNewScope({ ...newScope, consent_document: e.target.value })}
                placeholder="e.g. Contract-2024-001, signed authorization PDF"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes (Optional)</Label>
              <Input
                value={newScope.notes}
                onChange={(e) => setNewScope({ ...newScope, notes: e.target.value })}
                placeholder="Additional context..."
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddScope} disabled={loading === 'add'}>
              {loading === 'add' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add
            </Button>
          </div>
        </div>
      )}

      {scopes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShieldAlert className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No scopes defined for this project.</p>
          <p className="text-xs text-muted-foreground mt-1">Add a scope entry and approve it to enable scanning.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {scopes.map((scope) => {
            const config = scopeStatusConfig[scope.status];
            const StatusIcon = config.icon;
            return (
              <div key={scope.id} className="flex items-center gap-4 p-4">
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                  config.bg, config.border
                )}>
                  <StatusIcon className={cn('h-4.5 w-4.5', config.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground font-mono">
                      {scope.host_pattern}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-secondary">
                      {scope.scope_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className={cn('font-medium', config.color)}>{config.label}</span>
                    {scope.authorized_at && (
                      <>
                        <span>·</span>
                        <span suppressHydrationWarning>by {scope.authorized_by} on {format(new Date(scope.authorized_at), 'MMM d, yyyy')}</span>
                      </>
                    )}
                    {scope.consent_document && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <FileCheck className="h-3 w-3" />
                          {scope.consent_document}
                        </span>
                      </>
                    )}
                  </div>
                  {scope.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{scope.notes}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {scope.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs border-primary/20 text-primary hover:bg-primary/10"
                        onClick={() => updateScopeStatus(scope.id, 'approved')}
                        disabled={loading === scope.id}
                      >
                        {loading === scope.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs border-error/20 text-error hover:bg-error/10"
                        onClick={() => updateScopeStatus(scope.id, 'rejected')}
                        disabled={loading === scope.id}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                  {scope.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-error"
                      onClick={() => updateScopeStatus(scope.id, 'revoked')}
                      disabled={loading === scope.id}
                    >
                      {loading === scope.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
