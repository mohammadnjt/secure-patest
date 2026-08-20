'use client';

import { ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';

export function ScopeGateAlert() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-warning/10">
        <ShieldAlert className="h-4.5 w-4.5 text-warning" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-warning">Consent &amp; Scope Gate Active</p>
        <p className="text-xs text-muted-foreground mt-1">
          All active scans require an approved scope entry in the authorized scopes table.
          No scan will execute against a target that has not been explicitly authorized.
          Race condition and double-spending tests are restricted to staging environments only.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
