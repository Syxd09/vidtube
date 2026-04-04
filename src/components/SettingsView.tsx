import React from 'react';
import { Settings, Shield, Cpu, Palette, Database, Trash2, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SettingsView() {
  const [theme, setTheme] = React.useState('dark');
  const [apiType, setApiType] = React.useState('groq');

  const handleClear = () => {
    toast.error('This will delete all local knowledge. Permanent.', {
      action: {
        label: 'Confirm',
        onClick: () => {
          localStorage.clear();
          window.location.reload();
        }
      }
    });
  };

  return (
    <div className="flex flex-col min-h-full p-8 animate-fade-up">
      <div className="max-w-4xl mx-auto w-full">
        <header className="mb-12">
          <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Control Center</h2>
          <h1 className="text-4xl font-black text-white tracking-tighter">Settings</h1>
        </header>

        <div className="space-y-6">
          {/* Intelligence Section */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3 mb-2">
                <Cpu className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Intelligence Engine</h3>
              </div>
              <p className="text-xs font-medium text-white/30 uppercase tracking-widest">Select your primary multi-model analyzer</p>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'groq', label: 'Groq Llama 3', desc: 'Ultra-fast inference' },
                { id: 'google', label: 'Gemini 1.5 Pro', desc: 'Deep reasoning' },
                { id: 'openrouter', label: 'Claude 3.5 Sonnet', desc: 'Maximum fidelity' },
              ].map(provider => (
                <button
                  key={provider.id}
                  onClick={() => setApiType(provider.id)}
                  className={`flex flex-col text-left p-6 rounded-2xl border transition-all ${
                    apiType === provider.id 
                      ? 'bg-primary/10 border-primary/40 shadow-xl shadow-primary/5' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-white uppercase tracking-widest">{provider.label}</span>
                    {apiType === provider.id && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">{provider.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visuals */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Vibe & Visuals</h3>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 h-20 rounded-2xl bg-[#030303] border-2 border-primary/50 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-100 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Deep Black</span>
                  </div>
                </button>
                <button 
                  onClick={() => toast.info('Indigo mode coming soon')}
                  className="flex-1 h-20 rounded-2xl bg-[#0F172A] border border-white/10 relative overflow-hidden group grayscale"
                >
                  <div className="absolute inset-0 bg-white/5 flex items-center justify-center opacity-50">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Late Night</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Maintenance */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Persistence</h3>
              </div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-6 leading-relaxed">
                Manage your local intelligence vault and session integrity.
              </p>
              <Button 
                variant="destructive" 
                onClick={handleClear}
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest gap-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive"
              >
                <Trash2 className="w-4 h-4" /> Clear Vault
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-[32px]">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <Shield className="w-6 h-6 text-white/20" />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-widest">System Architecture</p>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Version v2.4.8-Intelligence</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline transition-all">
              API Docs <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
