import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Clock, Play } from 'lucide-react';
import type { TranscriptEntry } from '@/lib/youtube';
import { ScrollReveal } from '@/components/ScrollReveal';

interface TranscriptViewerProps {
  transcript: TranscriptEntry[];
  videoId: string;
}

export function TranscriptViewer({ transcript, videoId }: TranscriptViewerProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return transcript;
    const q = search.toLowerCase();
    return transcript.filter(t => t.text.toLowerCase().includes(q));
  }, [transcript, search]);

  const handleTimestampClick = (start: number) => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/${videoId}?start=${Math.floor(start)}&autoplay=1`;
      iframe.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <ScrollReveal delay={0.2}>
      <Card className="glass-strong overflow-hidden relative hover:shadow-xl transition-all duration-500">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/60 to-transparent rounded-l-lg" />
        <div className="p-5 border-b border-border/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Transcript</h3>
            <span className="text-sm text-muted-foreground ml-auto tabular-nums font-mono">{transcript.length} segments</span>
          </div>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            <Input
              placeholder="Search transcript..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-muted/30 border-border/30 focus-visible:ring-primary/30 rounded-xl"
            />
          </div>
        </div>
        <ScrollArea className="h-[420px]">
          <div className="p-3 space-y-0.5">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No matching segments</p>
            ) : (
              filtered.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => handleTimestampClick(entry.start)}
                  className="w-full text-left flex gap-3 p-3 rounded-xl hover:bg-primary/5 active:scale-[0.99] transition-all duration-200 group"
                >
                  <span className="flex items-center gap-1 text-xs font-mono text-primary shrink-0 mt-0.5 tabular-nums">
                    <Play className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-0.5 transition-opacity duration-200" />
                    {formatTime(entry.start)}
                  </span>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200 leading-relaxed">
                    {search ? highlightMatch(entry.text, search) : entry.text}
                  </span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </ScrollReveal>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function highlightMatch(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-foreground rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
