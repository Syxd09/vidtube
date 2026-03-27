import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SavedSummaries } from '@/components/SavedSummaries';
import { useSummaries } from '@/hooks/useSummaries';
import type { SummaryData } from '@/lib/youtube';

interface MainLayoutProps {
  children: React.ReactNode;
  summaries: SummaryData[];
  currentSummary: SummaryData | null;
  onSelectSummary: (summary: SummaryData) => void;
  onRemoveSummary: (id: string) => void;
  onHome?: () => void;
  onSearch?: (query?: string) => void;
  onLibrary?: () => void;
  onSettings?: () => void;
  onAnalytics?: () => void;
  onDocuments?: () => void;
  onDiscovery?: () => void;
  activeView?: string;
}

export function MainLayout({ 
  children, 
  summaries,
  currentSummary, 
  onSelectSummary, 
  onRemoveSummary,
  onHome,
  onSearch,
  onLibrary,
  onSettings,
  onAnalytics,
  onDocuments,
  onDiscovery,
  activeView
}: MainLayoutProps) {

  return (
    <div className="flex h-screen bg-[#030303] overflow-hidden selection:bg-primary/30">
      {/* Left Sidebar */}
      <AppSidebar 
        onHome={onHome} 
        onSearch={onSearch} 
        onLibrary={onLibrary} 
        onSettings={onSettings} 
        onAnalytics={onAnalytics}
        onDocuments={onDocuments}
        onDiscovery={onDiscovery}
        onSelectSummary={onSelectSummary}
        activeView={activeView}
        summaries={summaries}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#080808] border-x border-white/5">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </div>
      </main>

      {/* Right Sidebar (Library) */}
      <aside className="w-[320px] hidden xl:flex flex-col border-l border-white/5 bg-[#030303]">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Your Library</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <SavedSummaries 
            summaries={summaries}
            onSelect={onSelectSummary}
            onRemove={onRemoveSummary}
            activeId={currentSummary?.id}
          />
        </div>
      </aside>
    </div>
  );
}
