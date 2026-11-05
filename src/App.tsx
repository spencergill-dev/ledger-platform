import { useState } from 'react';
import { MOCK_DECISIONS } from './data/mockData';
import { Decision } from './types/decision';
import { Header } from './components/layout/Header';
import { StatCards } from './components/dashboard/StatCards';
import { RecentInsightsCard } from './components/dashboard/RecentInsightsCard';
import { DecisionTable } from './components/dashboard/DecisionTable';
import { DecisionMemoryTree } from './components/dashboard/DecisionMemoryTree';
import { NewDecisionModal } from './components/modals/NewDecisionModal';
import { DecisionSidePanel } from './components/drawer/DecisionSidePanel';
import { DecisionDeepDiveModal } from './components/modals/DecisionDeepDiveModal';
import { PasswordGate } from './components/auth/PasswordGate';
import { isPastDate, cn } from './lib/utils';
import { ShieldCheck, Table2, GitFork } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');

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
    <div className="min-h-screen bg-surface-page text-content-primary flex flex-col antialiased font-sans">
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
      <div className="flex-1 bg-surface-page w-full">
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-12 space-y-6">
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-content-muted font-medium mb-1">
              PORTFOLIO GOVERNANCE // AUDIT LEDGER
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-content-primary font-cal">
                Strategic Decisions Feed
              </h1>
              <Tooltip content="All hypotheses, metrics, and counterfactuals are cryptographically timestamped and immutable">
                <span className="inline-flex items-center gap-1 rounded bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-xs font-medium font-sans">
                  ✓ Audit Trail Active
                </span>
              </Tooltip>
            </div>
          </div>

          <div className="hidden sm:block text-xs font-sans shrink-0">
            <Tooltip content="Automated 6-month retrospective cadence requiring executive sign-off on metric variance">
              <span className="inline-flex items-center rounded-md border border-subtle bg-surface px-3 py-1.5 font-medium text-content-secondary shadow-2xs">
                Automated 6-Month Review Cadence
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

        {/* Main Decisions Ledger Table / Memory Tree */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-mono text-[10px] font-semibold tracking-wider text-content-muted uppercase">
                STRATEGIC DECISIONS LEDGER // INSTITUTIONAL MEMORY ({decisions.length} TRACKED COMMITMENTS)
              </h2>
            </div>

            {/* View Mode Switcher: Ledger Table vs Memory Tree */}
            <div className="inline-flex items-center p-1 rounded-lg bg-surface-muted border border-subtle text-xs select-none shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer",
                  viewMode === 'table'
                    ? "bg-surface text-content-primary shadow-2xs font-semibold"
                    : "text-content-muted hover:text-content-primary"
                )}
              >
                <Table2 className="h-3.5 w-3.5" />
                <span>Ledger Table</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('tree')}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer",
                  viewMode === 'tree'
                    ? "bg-surface text-content-primary shadow-2xs font-semibold"
                    : "text-content-muted hover:text-content-primary"
                )}
              >
                <GitFork className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Institutional Memory Tree</span>
                <span className="ml-0.5 text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                  Map
                </span>
              </button>
            </div>
          </div>

          {viewMode === 'table' ? (
            <DecisionTable 
              decisions={decisions} 
              onSelectDecision={handleSelectDecision}
              selectedDecisionId={isSidePanelOpen ? selectedDecision?.id : null}
            />
          ) : (
            <DecisionMemoryTree
              decisions={decisions}
              onSelectDecision={handleSelectDecision}
              onOpenDeepDive={handleOpenDeepDive}
              selectedDecisionId={isSidePanelOpen ? selectedDecision?.id : null}
            />
          )}
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
      <footer className="mt-auto border-t border-subtle py-6 text-xs text-content-muted bg-surface transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-content-primary">Praxus</span>
            <span>—</span>
            <span>Strategic Intelligence Platform</span>
          </div>
          <div className="text-content-muted font-sans">
            No Transient Tasks • Immutable Snapshots • Automated Retrospectives
          </div>
        </div>
      </footer>
    </div>
  );
}
