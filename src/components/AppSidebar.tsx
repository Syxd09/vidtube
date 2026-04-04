import React from 'react';
import { 
  BarChart3, 
  MessageSquare, 
  History, 
  Settings, 
  HelpCircle, 
  Sun, 
  Moon, 
  Search,
  LayoutGrid,
  Sparkles,
  Zap,
  Library,
  LogOut,
  Play,
  FileText,
  Globe,
  Shield
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { CortexLogo } from './CortexLogo';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { SummaryData } from '@/lib/youtube';

interface AppSidebarProps {
  onHome?: () => void;
  onSearch?: (query?: string) => void;
  onLibrary?: () => void;
  onSettings?: () => void;
  onSelectSummary?: (summary: SummaryData) => void;
  onAnalytics?: () => void;
  onDocuments?: () => void;
  onDiscovery?: () => void;
  activeView?: string;
  summaries?: SummaryData[];
}

export function AppSidebar({ 
  onHome, 
  onSearch, 
  onLibrary, 
  onSettings,
  onSelectSummary,
  onAnalytics,
  onDocuments,
  onDiscovery,
  activeView = 'workspace',
  summaries = []
}: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Sort by date DESC and take top 3
  const recentSummaries = [...summaries]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 3);

  const navItems = [
    { icon: MessageSquare, label: 'Analysis Terminal', id: 'workspace' },
    { icon: Globe, label: 'Discovery Hub', id: 'discovery' },
    { icon: Library, label: 'Intelligence Vault', id: 'library' },
    { icon: BarChart3, label: 'Analytics Hub', id: 'analytics' },
    ...(user?.is_admin || user?.email === 'syedmatheen.dev@gmail.com' ? [{ icon: Shield, label: 'Admin Terminal', id: 'admin' }] : []),
  ];

  return (
    <div className="w-[260px] flex flex-col h-full bg-[#030303] border-r border-white/5 p-4 py-8">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-4 mb-10 group cursor-pointer" onClick={onHome}>
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-primary/50 transition-all duration-500">
          <CortexLogo size={24} className="text-primary group-hover:scale-110 transition-transform" />
        </div>
        <span className="font-black text-white text-xl tracking-tighter leading-none whitespace-nowrap italic glitch-text-hover">CortexOS</span>
      </div>

      {/* Global Search */}
      <div className="relative mb-10 group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
        <input 
          placeholder="Search Knowledge..." 
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full h-10 bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/20 outline-none focus:border-primary/30 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/10 border border-white/5 px-1.5 py-0.5 rounded-md">
          ⌘K
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
        <section>
          <h2 className="px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">Core Units</h2>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.id === 'workspace') onHome?.();
                  if (item.id === 'discovery') onDiscovery?.();
                  if (item.id === 'library') onLibrary?.();
                  if (item.id === 'analytics') onAnalytics?.();
                  if (item.id === 'admin') navigate('/admin');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group border ${
                  activeView === item.id 
                    ? 'bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/5' 
                    : 'text-white/40 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                <item.icon className={`w-4 h-4 transition-colors ${activeView === item.id ? 'text-primary' : 'group-hover:text-primary'}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </section>

        {/* Recent Intelligence */}
        <section>
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Recent Recall</h2>
            <History className="w-3 h-3 text-white/10" />
          </div>
          <div className="space-y-1">
            {recentSummaries.length === 0 ? (
              <p className="px-4 text-[10px] font-bold text-white/10 uppercase tracking-widest leading-loose">No recent <br/> activity</p>
            ) : (
              recentSummaries.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectSummary?.(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white/30 hover:text-white hover:bg-white/5 transition-all text-left group"
                >
                  <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-primary/30 shadow-inner">
                    <Play className="w-2.5 h-2.5 fill-current" />
                  </div>
                  <span className="truncate">{s.title}</span>
                </button>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
        <nav className="space-y-1">
          <button 
            onClick={onSettings}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group border ${
              activeView === 'settings' 
                ? 'bg-primary/10 text-primary border-primary/20 shadow-sm' 
                : 'text-white/40 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <Settings className={`w-4 h-4 transition-transform ${activeView === 'settings' ? 'text-primary' : 'group-hover:rotate-45'}`} />
            Settings
          </button>
          <button 
            onClick={() => toast.info('Knowledge base coming soon')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            Support
          </button>
        </nav>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all text-left outline-none group shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform shadow-inner">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight">{user?.email?.split('@')[0] || 'Unknown User'}</p>
                <p className="text-[10px] font-medium text-white/30 truncate uppercase tracking-tighter">{user?.email || 'guest@cortexos.ai'}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56 glass-strong border-white/10 rounded-2xl p-2 mb-2">
            <DropdownMenuItem onClick={() => signOut()} className="rounded-xl focus:bg-destructive/10 text-destructive cursor-pointer gap-2 py-2.5 font-bold transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
