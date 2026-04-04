import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Search, 
  Zap, 
  Loader2, 
  BookOpen, 
  ChevronRight, 
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  Server,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { searchIntelligence } from '@/lib/ai-service';
import { toast } from 'sonner';

interface SearchResult {
  title: string;
  url: string;
  content: string;
  relevance: number;
}

function DecipherText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  
  React.useEffect(() => {
    let iteration = 0;
    // Calculate a dynamic speed based on text length to ensure 2-3s completion
    const speed = Math.max(2, Math.floor(text.length / 60));
    
    const interval = setInterval(() => {
      setDisplayText(
        text.split('')
          .map((char, index) => {
            if (char === '\n') return '\n'; // Preserve layout
            if (index < iteration) return text[index];
            
            // Only scramble the "decryption edge" (next 15 chars)
            if (index < iteration + 15) {
                return chars[Math.floor(Math.random() * chars.length)];
            }
            
            // Return empty space for anything far ahead to keep it clean
            return ' ';
          })
          .join('')
      );
      
      if (iteration >= text.length) clearInterval(interval);
      iteration += speed;
    }, 25);
    
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
}

export default function DeepSearch() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'scrape'>('search');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [step, setStep] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setResults([]);
    setReport(null);
    setStep(mode === 'search' ? 'Establishing Neural Link...' : 'Initializing Deep Scrape...');

    // Tactical Protocol Simulation
    const protocols = mode === 'search' 
      ? ['Crawling Index Nodes...', 'Bypassing Node Firewalls...', 'Scraping Tactical Fragments...', 'Correlating Implementation Vectors...', 'Synthesizing Intel Stream...']
      : ['Initializing Scrape Nodes...', 'Injecting Parser Scripts...', 'Extracting DOM Fragments...', 'Analyzing Cultural Nuance...', 'Neural Ingest Complete'];

    let pIndex = 0;
    const pInterval = setInterval(() => {
        if (pIndex < protocols.length) {
            setStep(protocols[pIndex]);
            pIndex++;
        }
    }, 600);

    try {
      const { report: synthesis, sources } = await searchIntelligence(`${mode.toUpperCase()}: ${query}`);
      
      clearInterval(pInterval);
      setStep('Intelligence Synthesis Complete');
      setTimeout(() => {
          setReport(synthesis);
          setResults(sources.map(s => ({ ...s, content: "Intelligence node verified & decrypted." })));
          toast.success(mode === 'search' ? 'Decryption Successful' : 'Node Analysis Complete');
          setIsSearching(false);
          setStep('');
      }, 500);
    } catch (err: any) {
      clearInterval(pInterval);
      toast.error('Neural Link Severed: ' + err.message);
      setIsSearching(false);
      setStep('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#030303]/40 relative overflow-hidden">
      {/* Scanline for Search Area Only */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50">
          <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>

      {/* Header / Search Bar */}
      <div className="p-12 pb-8 border-b border-white/5 bg-white/[0.02] backdrop-blur-3xl relative z-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                    <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Cortex // Neural Crawler</h2>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Deep Intelligence Search</h1>
                </div>
            </div>

            <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/5">
                {[
                    { id: 'search', label: 'Global Index', icon: Search },
                    { id: 'scrape', label: 'URL Ingest', icon: FileCode }
                ].map(op => (
                    <button
                        key={op.id}
                        onClick={() => setMode(op.id as any)}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                            mode === op.id ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-white/20 hover:text-white'
                        }`}
                    >
                        <op.icon className="w-3 h-3" />
                        {op.label}
                    </button>
                ))}
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={mode === 'search' ? "Search across the global intelligence index..." : "Paste URL for Deep Ingest..."}
              className="w-full h-18 bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-44 text-lg font-bold text-white placeholder:text-white/20 outline-none focus:border-primary/40 focus:bg-white/[0.08] transition-all duration-500 shadow-2xl"
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-12 px-8 rounded-[1.5rem] bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {mode === 'search' ? 'Engage' : 'Ingest Node'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-12 overflow-auto custom-scrollbar relative z-10">
        <div className="max-w-6xl mx-auto">
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent shadow-[0_0_30px_rgba(59,130,246,0.3)]" 
                />
                <div className="space-y-2">
                    <p className="text-xl font-black text-white tracking-tight uppercase tracking-[0.1em] glitch-text-hover">{step}</p>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] animate-pulse">Resolving Multi-Node Scraping Clusters</p>
                </div>
            </div>
          )}

          {!isSearching && !report && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40">
                {[
                    { icon: ShieldCheck, title: 'Secure Indexing', desc: 'Encrypted crawling protocols' },
                    { icon: Sparkles, title: 'AI Synthesis', desc: 'Multi-provider model logic' },
                    { icon: Server, title: 'Multi-Node', desc: 'Distributed proxy traversal' }
                ].map((feature) => (
                    <div key={feature.title} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4 hover:border-primary/20 transition-colors">
                        <feature.icon className="w-8 h-8 text-primary/60" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">{feature.title}</h3>
                        <p className="text-xs font-medium text-white/40 leading-relaxed uppercase tracking-tighter">{feature.desc}</p>
                    </div>
                ))}
            </div>
          )}

          <AnimatePresence>
            {report && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-24"
              >
                {/* Synthesis Report */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="p-10 rounded-[3rem] bg-white/[0.03] border border-white/5 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary/20">
                        <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5 }} />
                    </div>
                    
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#3b82f6]" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Final Intelligence Synthesis</span>
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-mono text-white/20 uppercase tracking-widest">
                            Node_Verify // <span className="text-primary italic">Success</span>
                        </div>
                    </div>
                    <div className="prose prose-invert prose-blue max-w-none">
                      <div className="text-white/80 leading-loose font-medium whitespace-pre-wrap selection:bg-primary/40 text-sm">
                        <DecipherText text={report} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sources & Tactical Data */}
                <div className="space-y-8">
                  <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-4">Retrieved Sources</h3>
                  <div className="space-y-4">
                    {results.map((res, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-white/[0.04] transition-all group cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-12 translate-x-12 group-hover:bg-primary/10 transition-colors" />
                        
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-[9px] font-black text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 uppercase tracking-tighter">
                                {res.relevance}% Match
                            </span>
                            <LinkIcon className="w-3.5 h-3.5 text-white/20 group-hover:text-primary transition-colors" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors relative z-10">{res.title}</h4>
                        <p className="text-[10px] font-medium text-white/30 line-clamp-2 uppercase tracking-tighter relative z-10">{res.content}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
