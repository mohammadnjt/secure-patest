'use client';

import { SCENARIOS } from '@/lib/scenarios';
import { Bot, UserCog, Hand } from 'lucide-react';

export function ScenarioCoverage() {
  const auto = SCENARIOS.filter((s) => s.executionType === 'auto').length;
  const semiAuto = SCENARIOS.filter((s) => s.executionType === 'semi-auto').length;
  const manual = SCENARIOS.filter((s) => s.executionType === 'manual').length;
  const total = SCENARIOS.length;

  const categories = Array.from(new Set(SCENARIOS.map((s) => s.category)));

  const data = [
    { label: 'Automated', count: auto, icon: Bot, color: 'text-primary', bg: 'bg-primary/10', bar: 'bg-primary' },
    { label: 'Semi-Automated', count: semiAuto, icon: UserCog, color: 'text-accent', bg: 'bg-accent/10', bar: 'bg-accent' },
    { label: 'Manual', count: manual, icon: Hand, color: 'text-warning', bg: 'bg-warning/10', bar: 'bg-warning' },
  ];

  return (
    <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Scenario Coverage</h3>
        <span className="text-xs text-muted-foreground">
          {total} scenarios · {categories.length} categories
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {data.map((d) => {
          const Icon = d.icon;
          const pct = Math.round((d.count / total) * 100);
          return (
            <div key={d.label} className="rounded-md border border-border bg-secondary/30 p-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-md ${d.bg} mb-2`}>
                <Icon className={`h-4 w-4 ${d.color}`} />
              </div>
              <div className="text-2xl font-bold tabular-nums">{d.count}</div>
              <div className="text-[11px] text-muted-foreground">{d.label}</div>
              <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full ${d.bar}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
        {categories.map((cat) => {
          const count = SCENARIOS.filter((s) => s.category === cat).length;
          return (
            <div key={cat} className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-secondary/40 transition-colors">
              <span className="text-muted-foreground truncate">{cat}</span>
              <span className="text-foreground font-medium tabular-nums shrink-0 ml-2">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
