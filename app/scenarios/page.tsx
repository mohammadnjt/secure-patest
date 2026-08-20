import { SCENARIOS, SCENARIO_CATEGORIES } from '@/lib/scenarios';
import { ScenarioCatalog } from '@/components/scenarios/scenario-catalog';
import { ListChecks } from 'lucide-react';

export const revalidate = 0;

export default function ScenariosPage() {
  const autoCount = SCENARIOS.filter((s) => s.executionType === 'auto').length;
  const semiAutoCount = SCENARIOS.filter((s) => s.executionType === 'semi-auto').length;
  const manualCount = SCENARIOS.filter((s) => s.executionType === 'manual').length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <ListChecks className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Scenario Catalog</h1>
            <p className="text-sm text-muted-foreground">
              {SCENARIOS.length} security test scenarios across {SCENARIO_CATEGORIES.length} categories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-center">
            <div className="text-lg font-bold text-primary tabular-nums">{autoCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Automated</div>
          </div>
          <div className="rounded-md border border-accent/20 bg-accent/5 px-3 py-2 text-center">
            <div className="text-lg font-bold text-accent tabular-nums">{semiAutoCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Semi-Auto</div>
          </div>
          <div className="rounded-md border border-warning/20 bg-warning/5 px-3 py-2 text-center">
            <div className="text-lg font-bold text-warning tabular-nums">{manualCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Manual</div>
          </div>
        </div>
      </div>

      <ScenarioCatalog />
    </div>
  );
}
