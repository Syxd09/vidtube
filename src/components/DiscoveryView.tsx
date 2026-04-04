import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Sparkles, TrendingUp, Cpu, Globe, Zap, ArrowRight, Search, Loader2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { searchVideos } from '@/lib/transcript-fetcher';
import { toast } from 'sonner';

interface DiscoveryViewProps {
  onAnalyze: (url: string) => void;
}

const FEATURED_VIDEOS = [
  {
    title: "The Future of AI: Agents & Intelligence",
    channel: "OpenAI Official",
    thumbnail: "https://i.ytimg.com/vi/gZzkLtZwqp0/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=gZzkLtZwqp0",
    category: "AI Research",
    tag: "Trending"
  },
  {
    title: "What is AGI? A Deep Dive with Sam Altman",
    channel: "Lex Fridman",
    thumbnail: "https://i.ytimg.com/vi/0O8Oydnt1WA/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=0O8Oydnt1WA",
    category: "Philosophy",
    tag: "Viral"
  },
  {
    title: "Next.js 15: The Absolute Best Way to Build",
    channel: "Vercel",
    thumbnail: "https://i.ytimg.com/vi/fBEYJ9Y-274/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=fBEYJ9Y-274",
    category: "DevTools",
    tag: "Latest"
  },
  {
    title: "How Large Language Models Work",
    channel: "3Blue1Brown",
    thumbnail: "https://i.ytimg.com/vi/wjZofJX0v4M/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=wjZofJX0v4M",
    category: "Education",
    tag: "Essential"
  }
];

export function DiscoveryView({ onAnalyze }: DiscoveryViewProps) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<any[]>(FEATURED_VIDEOS);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const searchResults = await searchVideos(query);
      if (searchResults.length > 0) {
        setResults(searchResults);
        toast.success(`Found ${searchResults.length} new resources for "${query}"`);
      } else {
        toast.error("No global intel found for this query.");
      }
    } catch (err) {
      toast.error("Search failed. Global protection may be active.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full p-8 animate-fade-up">
      <div className="max-w-7xl mx-auto w-full">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Discovery Engine</h2>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Intelligence Discovery</h1>
          </div>
          
          <form onSubmit={handleSearch} className="relative group min-w-[340px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="Search global intelligence..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-[20px] pl-12 pr-4 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-primary/40 focus:bg-white/[0.08] transition-all"
            />
            {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}
          </form>
        </header>

        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {results.map((v, i) => (
              <ScrollReveal key={v.url + i} delay={i * 0.1}>
                <Card 
                  className="group relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-[40px] hover:border-primary/40 hover:bg-white/[0.04] transition-all duration-700 shadow-2xl cursor-pointer"
                  onClick={() => onAnalyze(v.url)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={v.thumbnail} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 blur-0" 
                      alt={v.title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-black/20 to-transparent opacity-80" />
                    
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-primary/90 text-white font-black uppercase text-[9px] tracking-widest px-3 py-1 shadow-2xl">{v.tag}</Badge>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_50px_rgba(0,106,255,0.5)] border border-white/20">
                        <Sparkles className="w-6 h-6 text-white animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Globe className="w-3 h-3 text-white/40" />
                      </div>
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">{v.channel}</span>
                    </div>
                    <h3 className="text-xl font-black text-white leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">{v.title}</h3>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {v.category}
                      </div>
                      <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        Extract Intel <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {results.length > 0 && results[0].tag === 'Search' && (
           <div className="text-center pb-8 animate-fade-in">
              <button 
                onClick={() => setResults(FEATURED_VIDEOS)}
                className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-primary transition-colors"
              >
                ← Back to Featured Intelligence
              </button>
           </div>
        )}

        <section className="py-12 border-t border-white/5 text-center">
           <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Cpu className="w-8 h-8 text-primary" />
           </div>
           <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Global Intel Integration</h2>
           <p className="text-white/30 text-sm max-w-xl mx-auto uppercase tracking-widest leading-loose font-bold">
             Search and analyze any content across the global information network <br/> directly from your professional intelligence terminal.
           </p>
        </section>
      </div>
    </div>
  );
}
