'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Columns3,
  Clock,
  Sparkles,
  Zap,
  Flame,
  Lightbulb,
  Download,
  Upload,
} from 'lucide-react';

interface SidebarProps {
  stats: {
    total: number;
    byStage: {
      spark: number;
      exploring: number;
      building: number;
      shipped: number;
      paused: number;
    };
    permasolutions: number;
  } | null;
  onExport: () => void;
  onImportClick: () => void;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kanban', label: 'Kanban', icon: Columns3 },
  { href: '/timeline', label: 'Timeline', icon: Clock },
  { href: '/insights', label: 'Insights', icon: Sparkles },
];

export function Sidebar({ stats, onExport, onImportClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[var(--card)] border-r border-[var(--border)] h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--spark)] to-[var(--primary)] flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--foreground)]">
                Kindling
              </h1>
              <p className="text-xs text-[var(--muted-foreground)]">Where ideas catch fire</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl color-transition ${
                  isActive
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse-ring' : ''}`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        {stats && (
          <div className="p-4 border-t border-[var(--border)]">
            <h3 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
              The Fire
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center stagger-children">
              <div className="p-2 bg-[var(--spark-bg)] rounded-xl group cursor-default">
                <Zap className="w-4 h-4 mx-auto text-[var(--spark)] mb-1 group-hover:animate-spark-glow" />
                <span className="block text-lg font-bold text-[var(--spark)]">
                  {stats.byStage.spark}
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)]">Sparks</span>
              </div>
              <div className="p-2 bg-[var(--building-bg)] rounded-xl group cursor-default">
                <Flame className="w-4 h-4 mx-auto text-[var(--building)] mb-1" />
                <span className="block text-lg font-bold text-[var(--building)]">
                  {stats.byStage.building}
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)]">Blazing</span>
              </div>
              <div className="p-2 bg-[var(--shipped-bg)] rounded-xl group cursor-default">
                <Lightbulb className="w-4 h-4 mx-auto text-[var(--shipped)] mb-1 group-hover:animate-celebrate" />
                <span className="block text-lg font-bold text-[var(--shipped)]">
                  {stats.byStage.shipped}
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)]">Beacons</span>
              </div>
            </div>
          </div>
        )}

        {/* Import/Export */}
        <div className="p-4 border-t border-[var(--border)] space-y-2">
          <button
            onClick={onExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] rounded-xl color-transition btn-press"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={onImportClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] rounded-xl color-transition btn-press"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--card)]/95 backdrop-blur-lg border-t border-[var(--border)] z-50 safe-area-pb">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full color-transition relative ${
                  isActive
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--muted-foreground)]'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[var(--primary)] rounded-full" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'animate-count-pop' : ''}`} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
