import React, { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SavedSummaries } from '@/components/SavedSummaries';
import type { SummaryData } from '@/lib/youtube';
import { Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);       // Mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop collapse

  const sidebarProps = {
    onHome, onSearch, onLibrary, onSettings,
    onAnalytics, onDocuments, onDiscovery,
    onSelectSummary, activeView, summaries,
  };

  return (
    <div className="flex h-screen bg-[#030303] overflow-hidden selection:bg-primary/30">

      {/* ===== MOBILE: Overlay Drawer ===== */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`
        fixed inset-y-0 left-0 z-50 md:hidden
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="relative h-full">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-[-44px] z-50 w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <div onClick={() => setSidebarOpen(false)}>
            <AppSidebar {...sidebarProps} />
          </div>
        </div>
      </div>

      {/* ===== DESKTOP: Collapsible Sidebar ===== */}
      <div className={`
        hidden md:flex flex-col relative
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-[260px]'}
      `}>
        <AppSidebar {...sidebarProps} />
      </div>

      {/* ===== Main Content Area ===== */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#080808] border-x border-white/5">
        {/* Top Bar with toggle buttons */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex w-9 h-9 rounded-xl bg-white/5 border border-white/10 items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            title={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Page title */}
          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.15em] ml-1">
            {activeView === 'workspace' ? 'Analysis Terminal' : 
             activeView === 'discovery' ? 'Discovery Hub' : 
             activeView === 'library' ? 'Intelligence Vault' : 
             activeView === 'analytics' ? 'Analytics Hub' : 
             activeView === 'settings' ? 'Settings' : 'CortexOS'}
          </span>
        </div>

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
