import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Download, Copy, Check, FileText, List, Sparkles } from 'lucide-react';
import type { SummaryData } from '@/lib/youtube';
import { toast } from 'sonner';
import { ScrollReveal } from '@/components/ScrollReveal';

interface SummaryPanelProps {
  data: SummaryData;
  onSave: (data: SummaryData) => void;
  isSaved: boolean;
}

export function SummaryPanel({ data, onSave, isSaved }: SummaryPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `# ${data.title}\n\n## Summary\n${data.summary}\n\n## Key Points\n${data.keyPoints.map(p => `- ${p}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    const text = `# ${data.title}\n\n## Summary\n${data.summary}\n\n## Key Points\n${data.keyPoints.map(p => `- ${p}`).join('\n')}\n\n## Transcript\n${data.transcript.map(t => `[${formatTime(t.start)}] ${t.text}`).join('\n')}`;
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
        <Card className="overflow-hidden border-border/40 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/5 transition-shadow duration-500">
          <div className="aspect-video bg-muted relative group">
            <iframe
              src={`https://www.youtube.com/embed/${data.videoId}`}
              title={data.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="p-5 bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3 text-balance leading-tight">{data.title}</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onSave(data)} className="gap-1.5 hover:border-primary/40 transition-colors">
                <Bookmark className={`w-4 h-4 transition-all duration-200 ${isSaved ? 'fill-primary text-primary scale-110' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportMarkdown} className="gap-1.5">
                <Download className="w-4 h-4" />
                Export .md
              </Button>
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Summary */}
      <ScrollReveal delay={0.1}>
        <Card className="p-6 border-border/40 shadow-lg shadow-black/5 hover:shadow-xl transition-shadow duration-500 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/20 rounded-l-lg" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">AI Summary</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed text-pretty pl-1">{data.summary}</p>
        </Card>
      </ScrollReveal>

      {/* Key Points */}
      <ScrollReveal delay={0.15}>
        <Card className="p-6 border-border/40 shadow-lg shadow-black/5 hover:shadow-xl transition-shadow duration-500 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent to-accent/20 rounded-l-lg" />
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <List className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Key Points</h3>
          </div>
          <ul className="space-y-4">
            {data.keyPoints.map((point, i) => (
              <li key={i} className="flex gap-3 group">
                <Badge className="h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold bg-primary/10 text-primary border-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {i + 1}
                </Badge>
                <span className="text-muted-foreground text-pretty pt-0.5 group-hover:text-foreground transition-colors duration-300">{point}</span>
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
