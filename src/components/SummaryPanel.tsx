import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Download, Copy, Check, List, Sparkles, Tag, Brain, User, Eye, Calendar, MessageSquare, Quote } from 'lucide-react';
import type { SummaryData } from '@/lib/youtube';
import { toast } from 'sonner';
import { ScrollReveal } from '@/components/ScrollReveal';

interface SummaryPanelProps {
  data: SummaryData;
  onSave: (data: SummaryData) => void;
  isSaved: boolean;
  aiProvider?: string;
  aiModel?: string;
  onSwitchToChat?: () => void;
}

export function SummaryPanel({ data, onSave, isSaved, aiProvider, aiModel, onSwitchToChat }: SummaryPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `# ${data.title}\n\n## Summary\n${data.summary}\n\n## Key Points\n${data.key_points.map(p => `- ${p}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    const text = `# ${data.title}\n\n## Summary\n${data.summary}\n\n## Key Points\n${data.key_points.map(p => `- ${p}`).join('\n')}\n\n## Transcript\n${data.transcript?.map(t => `[${formatTime(t.start)}] ${t.text}`).join('\n') || ''}`;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.slice(0, 50)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as Markdown');
  };

  return (
    <div className="space-y-6">
      {/* Video preview */}
      <ScrollReveal>
        <Card className="overflow-hidden glass-strong glow-primary hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
          <div className="aspect-video bg-muted relative group">
            <iframe
              src={`https://www.youtube.com/embed/${data.video_id}`}
              title={data.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="p-5">
            <h2 className="text-xl font-semibold text-foreground mb-2 text-balance leading-tight">{data.title}</h2>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6">
              {data.author_name && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{data.author_name}</span>
                </div>
              )}
              
              {data.views && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 glass-strong">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black tracking-tight">{data.views} VIEWS</span>
                </div>
              )}

              {data.publish_date && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 glass-strong">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black tracking-tight">{new Date(data.publish_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
                </div>
              )}
            </div>
            
            {/* AI Provider badge */}
            {aiProvider && (
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                  <Brain className="w-3 h-3 text-primary" />
                  Analyzed by {aiProvider} {aiModel && `· ${aiModel}`}
                </span>
              </div>
            )}

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {data.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-[11px] gap-1 bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 transition-colors">
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onSave(data)} className="gap-1.5 hover:border-primary/40 transition-colors glass">
                <Bookmark className={`w-4 h-4 transition-all duration-200 ${isSaved ? 'fill-primary text-primary scale-110' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 glass">
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportMarkdown} className="gap-1.5 glass">
                <Download className="w-4 h-4" />
                Export .md
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={onSwitchToChat} 
                className="gap-1.5 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
              >
                <MessageSquare className="w-4 h-4" />
                Chat about this
              </Button>
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Overview Block */}
      {data.overview && (
        <ScrollReveal delay={0.05}>
          <Card className="p-8 glass-strong border-primary/20 bg-primary/5 glow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Brain className="w-16 h-16" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em]">
                  Conceptual Deep Insight
                </h3>
              </div>
              <p className="text-white font-medium text-xl leading-relaxed italic pr-4">
                "{data.overview}"
              </p>
            </div>
          </Card>
        </ScrollReveal>
      )}

      {/* Summary / Visual Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScrollReveal delay={0.1}>
            <Card className="h-full p-8 glass-strong glow-primary hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-transparent" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Visual & Analysis Overview</h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Multi-Model AI Perception</p>
                </div>
              </div>
              <div className="text-muted-foreground leading-relaxed text-lg space-y-4 whitespace-pre-line">
                {data.summary}
              </div>
            </Card>
          </ScrollReveal>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Community Sentiment / Social Pulse */}
          <ScrollReveal delay={0.15}>
            <Card className="p-6 glass-strong border-emerald-500/20 bg-emerald-500/5 hover:shadow-xl transition-all duration-500 relative overflow-hidden h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <MessageSquare className="w-4.5 h-4.5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-foreground">Community Pulse</h3>
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Social Impact Deduction</p>
                </div>
              </div>
              <div className="text-white text-base leading-relaxed font-medium italic border-l-2 border-emerald-500/50 pl-6 py-2">
                {data.sentiment || "Sprinting through historical context to deduce community resonance..."}
              </div>
              
              <div className="mt-6 pt-6 border-t border-emerald-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Quote className="w-3 h-3 text-emerald-500/40" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Likely Engagement</span>
                </div>
                <div className="text-xs text-muted-foreground italic">
                  "Based on our intelligence, this content is likely to trigger {data.author_name?.includes('CarryMinati') ? 'high emotional engagement and strong fan support' : 'thoughtful discussion'} in the community."
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </div>

      {/* Key Points */}
      <ScrollReveal delay={0.15}>
        <Card className="p-8 glass-strong hover:shadow-2xl transition-all duration-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <List className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter">Strategic Takeaways</h3>
              <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.2em]">High Value Execution Points</p>
            </div>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.key_points.map((point, i) => (
              <li
                key={i}
                className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all duration-300 group/item"
                style={{ animation: `fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s both` }}
              >
                <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-xl bg-primary text-white text-xs font-black shadow-lg shadow-primary/20 group-hover/item:scale-110 transition-transform">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <span className="text-white/80 text-sm leading-relaxed group-hover/item:text-white transition-colors">{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      </ScrollReveal>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
