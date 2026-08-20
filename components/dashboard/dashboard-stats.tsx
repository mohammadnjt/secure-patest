'use client';

import { ScanLine, ShieldCheck, AlertCircle, CheckCircle2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  scan: ScanLine,
  shield: ShieldCheck,
  alert: AlertCircle,
  check: CheckCircle2,
};

type StatItem = {
  label: string;
  value: number;
  iconKey: string;
  color: string;
  bg: string;
  border: string;
};

export function DashboardStats({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = ICONS[stat.iconKey] || ScanLine;
        return (
          <div
            key={stat.label}
            className={cn(
              'relative overflow-hidden rounded-lg border bg-card p-5 transition-all hover:border-primary/30',
              stat.border
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold mt-2 text-foreground">
                  {stat.value}
                </p>
              </div>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  stat.bg
                )}
              >
                <Icon className={cn('h-5 w-5', stat.color)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
