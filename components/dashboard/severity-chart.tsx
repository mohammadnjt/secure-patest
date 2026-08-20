'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import { AlertCircle } from 'lucide-react';

type SeverityCounts = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
};

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
  info: '#64748b',
};

export function SeverityChart({ severityCounts }: { severityCounts: SeverityCounts }) {
  const data = [
    { name: 'Critical', value: severityCounts.critical, fill: COLORS.critical },
    { name: 'High', value: severityCounts.high, fill: COLORS.high },
    { name: 'Medium', value: severityCounts.medium, fill: COLORS.medium },
    { name: 'Low', value: severityCounts.low, fill: COLORS.low },
  ].filter((d) => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-4 w-4 text-error" />
        <h3 className="text-sm font-semibold">Vulnerabilities by Severity</h3>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center h-[240px] text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-3">
            <span className="text-2xl">0</span>
          </div>
          <p className="text-sm text-muted-foreground">
            No vulnerabilities detected yet.
            <br />
            Run a scan to see results.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: d.fill }}
                  />
                  <span className="font-medium text-foreground">{d.name}</span>
                </span>
                <span className="text-muted-foreground tabular-nums">{d.value}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(d.value / total) * 100}%`,
                    backgroundColor: d.fill,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Vulnerabilities</span>
            <span className="text-lg font-bold text-error tabular-nums">{total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
