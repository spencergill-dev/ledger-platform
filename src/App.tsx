import { useState } from 'react';
import { MOCK_DECISIONS } from './data/mockData';
import { Decision } from './types/decision';
import { Header } from './components/layout/Header';
import { StatCards } from './components/dashboard/StatCards';
import { RecentInsightsCard } from './components/dashboard/RecentInsightsCard';
import { DecisionTable } from './components/dashboard/DecisionTable';
import { NewDecisionModal } from './components/modals/NewDecisionModal';
import { DecisionSidePanel } from './components/drawer/DecisionSidePanel';
import { DecisionDeepDiveModal } from './components/modals/DecisionDeepDiveModal';
import { PasswordGate } from './components/auth/PasswordGate';
import { isPastDate } from './lib/utils';
import { ShieldCheck } from 'lucide-react';

import { Tooltip } from './components/ui/Tooltip';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('praxus_authenticated') === 'true';
  });
  const [decisions, setDecisions] = useState<Decision[]>(MOCK_DECISIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [deepDiveDecision, setDeepDiveDecision] = useState<Decision | null>(null);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);

  const handleAddDecision = (newDecision: Decision) => {
    setDecisions((prev) => [newDecision, ...prev]);
  };

  const handleSelectDecision = (decision: Decision) => {
    setSelectedDecision(decision);
    setIsSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setSelectedDecision(null);
  };

  const handleOpenDeepDive = (decision: Decision) => {
    setDeepDiveDecision(decision);
    setIsDeepDiveOpen(true);
  };

  const overdueCount = decisions.filter(
    (d) => d.status === 'Review Due' && isPastDate(d.targetReviewDate)
  ).length;

  const totalCapital = decisions.reduce(
    (sum, d) => sum + d.originalEstimates.capitalAtRisk,
    0
  );

  if (!isAuthenticated) {
    return <PasswordGate onUnlock={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-foreground flex flex-col antialiased font-sans">
      {/* Solid Top Bar Header */}
      <Header
        onOpenNewDecision={() => setIsModalOpen(true)}
        overdueCount={overdueCount}
        totalCapital={totalCapital}
        onLock={() => {
          localStorage.removeItem('praxus_authenticated');
          setIsAuthenticated(false);
        }}
      />

      {/* Main Icy Canvas Wrapper */}
      <div className="flex-1 bg-slate-50 dark:bg-[#0A0A0A] w-full">
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-12 space-y-6">
        
        {/* Title Header with tracking-tight and high contrast */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-cal">
              Strategic Decisions Feed
            </h1>
            <Tooltip content="All hypotheses, metrics, and counterfactuals are cryptographically timestamped and immutable">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-xs font-medium font-sans cursor-help">
                ✓ Audit Trail Active
              </span>
            </Tooltip>
          </div>

          <div className="hidden sm:block text-xs font-sans shrink-0">
            <Tooltip content="Automated 6-month retrospective cadence requiring executive sign-off on metric variance">
              <span className="inline-flex items-center rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-[#171717] px-3 py-1.5 font-medium text-gray-800 dark:text-gray-200 shadow-2xs cursor-help">
                Forced Retrospective Protocol v2.4
              </span>
            </Tooltip>
          </div>
        </div>

        {/* High-Level Institutional Aggregate Metrics (Stat Cards) */}
        <StatCards decisions={decisions} />

        {/* Recent Precedent Insights Card */}
        <div className="w-full">
          <RecentInsightsCard />
        </div>

        {/* Main Decisions Ledger Table */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-sans">
              DECISIONS LEDGER ({decisions.length} RECORDED COMMITMENTS)
            </h2>
          </div>

          <DecisionTable 
            decisions={decisions} 
            onSelectDecision={handleSelectDecision}
            selectedDecisionId={isSidePanelOpen ? selectedDecision?.id : null}
          />
        </section>

      </main>
      </div>

      {/* Slide-Over Side Panel Drawer */}
      <DecisionSidePanel
        decision={selectedDecision}
        isOpen={isSidePanelOpen}
        onClose={handleCloseSidePanel}
        onOpenDeepDive={handleOpenDeepDive}
      />

      {/* Dedicated Full Page / Audit Trail Modal (Deep Dive) */}
      <DecisionDeepDiveModal
        decision={deepDiveDecision || selectedDecision}
        isOpen={isDeepDiveOpen}
        onClose={() => setIsDeepDiveOpen(false)}
      />

      {/* Record Decision Modal */}
      <NewDecisionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddDecision={handleAddDecision}
      />

      {/* Bespoke Footer */}
      <footer className="mt-auto border-t border-gray-200 dark:border-neutral-800 py-6 text-xs text-gray-500 bg-white dark:bg-[#171717] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-gray-900 dark:text-white">Praxus</span>
            <span>—</span>
            <span>Strategic Intelligence Platform</span>
          </div>
          <div className="text-gray-500 font-sans">
            No Transient Tasks • Immutable Snapshots • Automated Retrospectives
          </div>
        </div>
      </footer>
    </div>
  );
}
