import { useState } from 'react';
import { MOCK_RECENT_INSIGHTS } from '../../data/mockData';
import { ChevronRight } from 'lucide-react';

export function RecentInsightsCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeInsight = MOCK_RECENT_INSIGHTS[activeIndex];

  return (
    <div className="rounded-md border border-slate-200 dark:border-neutral-800 border-l-4 border-l-blue-600 dark:border-l-blue-500 bg-white dark:bg-[#171717] p-4 transition-colors shadow-2xs space-y-2">
      {/* Top line: Bold Title + Muted Upper Kicker */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold text-slate-900 dark:text-white text-sm font-sans">
          Compounding Decision Memory
        </span>
        <span className="font-mono text-[10px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
          {activeInsight.headline}
        </span>
      </div>

      {/* Insight Directive */}
      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-normal leading-relaxed font-sans">
        "{activeInsight.insight}"
      </p>

      {/* Micro-footer: Relocated Source Metadata (Left) + Pagination (Right) */}
      <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
          <span>
            Source: <span className="font-medium text-slate-700 dark:text-slate-300">{activeInsight.decisionTitle}</span>
          </span>
          <span className="text-slate-300 dark:text-neutral-700">•</span>
          <span>{activeInsight.dateLogged}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>Insight {activeIndex + 1} of {MOCK_RECENT_INSIGHTS.length}</span>
          <span className="text-slate-300 dark:text-neutral-700">•</span>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % MOCK_RECENT_INSIGHTS.length)}
            className="flex items-center gap-0.5 font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span>Next Insight</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
