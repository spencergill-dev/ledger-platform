import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { Plus, AlertTriangle, Layers } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

interface HeaderProps {
  onOpenNewDecision: () => void;
  overdueCount: number;
  totalCapital: number;
}

export function Header({ onOpenNewDecision, overdueCount, totalCapital }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B1121] border-b border-slate-800/80 shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 relative">
        
        {/* Brand Logo */}
        <div className="flex items-center">
          <Tooltip content="Praxus Strategic Intelligence Platform" position="bottom">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-900/40 shrink-0 select-none">
                <Layers className="h-5 w-5 text-white stroke-[2.2]" />
              </div>

              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Praxus
              </span>
            </div>
          </Tooltip>
        </div>

        {/* Quick Metrics Bar Centered in Header */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-3 px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-xs">
          <Tooltip content="Total financial capital currently committed across all strategic bets" position="bottom">
            <div className="flex items-center gap-1.5 cursor-help">
              <span className="text-slate-400 font-sans">Capital Committed:</span>
              <span className="font-bold tabular-nums text-white">
                ${(totalCapital / 1000000).toFixed(2)}M
              </span>
            </div>
          </Tooltip>

          {overdueCount > 0 && (
            <>
              <span className="text-slate-700">•</span>
              <Tooltip content="Decisions that have breached the mandatory 6-month retrospective SLA window" position="bottom">
                <div className="flex items-center gap-1.5 text-rose-400 font-medium text-xs cursor-help">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span>{overdueCount} Overdue Retrospective{overdueCount > 1 ? 's' : ''}</span>
                </div>
              </Tooltip>
            </>
          )}
        </div>

        {/* Actions: Primary CTA Button matching other buttons */}
        <div className="flex items-center gap-2.5">
          <Tooltip content="Toggle color theme" position="bottom">
            <div>
              <ThemeToggle />
            </div>
          </Tooltip>

          <Tooltip content="Record a new strategic decision with immutable hypotheses and payoff criteria" position="bottom">
            <Button
              onClick={onOpenNewDecision}
              size="sm"
              className="bg-[#1D4ED8] hover:bg-blue-700 text-white font-medium text-xs h-9 px-3.5 gap-1.5 rounded-lg shadow-sm border border-blue-500/30 active:scale-[0.99] transition-all"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Record Decision</span>
            </Button>
          </Tooltip>
        </div>

      </div>
    </header>
  );
}
