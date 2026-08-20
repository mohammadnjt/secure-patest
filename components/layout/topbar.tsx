'use client';

import { Activity, AlertTriangle, Bell } from 'lucide-react';

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 text-primary" />
          <span>Security Operations Center</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning/5 px-3 py-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          <span className="text-xs text-warning font-medium">Consent Gate Active</span>
        </div>
        <button className="relative rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error" />
        </button>
        <div className="flex items-center gap-2.5 border-l border-border pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary">
            SO
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium text-foreground">Sec Officer</div>
            <div className="text-[10px] text-muted-foreground">Analyst</div>
          </div>
        </div>
      </div>
    </header>
  );
}
