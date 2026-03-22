import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, BookOpen } from 'lucide-react';
import type { SummaryData } from '@/lib/youtube';
import { ScrollReveal } from '@/components/ScrollReveal';

interface SavedSummariesProps {
  summaries: SummaryData[];
  onSelect: (summary: SummaryData) => void;
  onRemove: (id: string) => void;
  activeId?: string;
}

export function SavedSummaries({ summaries, onSelect, onRemove, activeId }: SavedSummariesProps) {
  if (summaries.length === 0) {
    return (
      <ScrollReveal direction="right">
        <Card className="p-8 border-border/40 shadow-lg shadow-black/5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">Saved summaries will appear here</p>
        </Card>
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal direction="right">
      <Card className="border-border/40 shadow-lg shadow-black/5 overflow-hidden hover:shadow-xl transition-shadow duration-500">
        <div className="p-4 border-b border-border/40 bg-card">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            Library
            <span className="text-sm font-normal text-muted-foreground ml-auto tabular-nums">{summaries.length}</span>
          </h3>
        </div>
        <ScrollArea className="h-[340px]">
          <div className="p-2 space-y-1">
            {summaries.map((s, i) => (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group active:scale-[0.98] ${
                  activeId === s.id 
                    ? 'bg-primary/8 shadow-sm' 
                    : 'hover:bg-muted/50'
                }`}
                style={{ animation: `fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s backwards` }}
              >
                <img
                  src={s.thumbnail}
                  alt=""
                  className="w-18 h-11 rounded-lg object-cover shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate leading-snug">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 shrink-0 h-8 w-8 hover:text-destructive transition-all duration-200"
                  onClick={e => { e.stopPropagation(); onRemove(s.id); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </ScrollReveal>
  );
}
