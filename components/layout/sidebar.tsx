'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, FolderKanban, ScanLine, ListChecks, FileText, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/scans', label: 'Scan Runs', icon: ScanLine },
  { href: '/scenarios', label: 'Scenario Catalog', icon: ListChecks },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/audit', label: 'Audit Log', icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card/50 backdrop-blur-sm sticky top-0 h-screen">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/30 glow-primary">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">SecScan</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">PTaaS Platform</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-border">
        <div className="rounded-md bg-secondary/50 px-3 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </div>
          <div className="text-muted-foreground">101 scenarios loaded</div>
        </div>
      </div>
    </aside>
  );
}
