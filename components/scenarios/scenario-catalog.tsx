'use client';

import { useState, useMemo } from 'react';
import {
  SCENARIOS,
  SEVERITY_COLORS,
  EXECUTION_TYPE_LABELS,
  type ExecutionType,
} from '@/lib/scenarios';
import { cn } from '@/lib/utils';
import {
  Search, Bot, UserCog, Hand, ChevronDown, ChevronRight,
  Wrench, Shield,
} from 'lucide-react';

const EXEC_ICON: Record<ExecutionType, typeof Bot> = {
  auto: Bot,
  'semi-auto': UserCog,
  manual: Hand,
};

const EXEC_BADGE: Record<ExecutionType, string> = {
  auto: 'bg-primary/10 text-primary border-primary/20',
  'semi-auto': 'bg-accent/10 text-accent border-accent/20',
  manual: 'bg-warning/10 text-warning border-warning/20',
};

export function ScenarioCatalog() {
  const [search, setSearch] = useState('');
  const [execFilter, setExecFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const categories = useMemo(
    () => Array.from(new Set(SCENARIOS.map((s) => s.category))).sort(),
    []
  );

  const filtered = useMemo(() => {
    return SCENARIOS.filter((s) => {
      if (execFilter !== 'all' && s.executionType !== execFilter) return false;
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tool.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, execFilter, categoryFilter]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof SCENARIOS>();
    for (const s of filtered) {
      const arr = map.get(s.category) || [];
      arr.push(s);
      map.set(s.category, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const toggleCategory = (cat: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scenarios by title, code, description, or tool..."
            className="w-full h-10 rounded-md border border-input bg-background pl-10 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={execFilter}
          onChange={(e) => setExecFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Types</option>
          <option value="auto">Automated</option>
          <option value="semi-auto">Semi-Automated</option>
          <option value="manual">Manual</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm max-w-[180px]"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {SCENARIOS.length} scenarios
      </p>

      {/* Grouped results */}
      <div className="space-y-2">
        {grouped.map(([category, scenarios]) => {
          const isExpanded = expanded.has(category) || search !== '' || execFilter !== 'all' || categoryFilter !== 'all';
          const vulnCount = scenarios.filter((s) => s.severity === 'critical' || s.severity === 'high').length;
          return (
            <div key={category} className="rounded-lg border border-border bg-card overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-3 w-full p-4 hover:bg-secondary/20 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{category}</div>
                  <div className="text-xs text-muted-foreground">{scenarios.length} scenarios</div>
                </div>
                {vulnCount > 0 && (
                  <span className="text-[10px] text-error font-medium px-2 py-0.5 rounded border border-error/20 bg-error/5 shrink-0">
                    {vulnCount} high+ severity
                  </span>
                )}
              </button>

              {isExpanded && (
                <div className="divide-y divide-border border-t border-border">
                  {scenarios.map((scenario) => {
                    const ExecIcon = EXEC_ICON[scenario.executionType];
                    return (
                      <div key={scenario.code} className="flex items-start gap-3 p-3 hover:bg-secondary/10 transition-colors">
                        <div className="flex h-7 w-14 shrink-0 items-center justify-center rounded text-[10px] font-mono font-medium border border-border bg-secondary/30 mt-0.5">
                          {scenario.code.replace('SCN-', 'SCN-')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground">{scenario.title}</span>
                            <span className={cn(
                              'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border',
                              EXEC_BADGE[scenario.executionType]
                            )}>
                              <ExecIcon className="h-2.5 w-2.5" />
                              {EXECUTION_TYPE_LABELS[scenario.executionType]}
                            </span>
                            <span className={cn(
                              'px-1.5 py-0.5 rounded text-[10px] font-medium border',
                              SEVERITY_COLORS[scenario.severity]
                            )}>
                              {scenario.severity}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
                          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                            <Wrench className="h-3 w-3" />
                            <span>{scenario.tool}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
          <Search className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No scenarios match your search.</p>
        </div>
      )}
    </div>
  );
}
