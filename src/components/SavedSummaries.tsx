import { Button } from '@/components/ui/button';
import { Trash2, BookOpen, Clock } from 'lucide-react';
import type { SummaryData } from '@/lib/youtube';

interface SavedSummariesProps {
  summaries: SummaryData[];
  onSelect: (summary: SummaryData) => void;
  onRemove: (id: string) => void;
  activeId?: string;
}

export function SavedSummaries({ summaries, onSelect, onRemove, activeId }: SavedSummariesProps) {
  if (summaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center px-6">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-white/10" />
        </div>
        <p className="text-xs font-bold text-white/20 uppercase tracking-widest leading-loose">
          Saved analyses <br/> will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {summaries.map((s, i) => (
        <div
          key={s.id}
          onClick={() => onSelect(s)}
          className={`group relative flex flex-col p-4 rounded-2xl transition-all duration-300 cursor-pointer border ${
            activeId === s.id
              ? 'bg-white/5 border-white/10 shadow-lg shadow-black/50'
              : 'hover:bg-white/[0.02] border-transparent'
          }`}
          style={{ animation: `fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s both` }}
        >
          {activeId === s.id && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_15px_rgba(0,106,255,0.5)]" />
          )}

          <div className="flex items-start justify-between gap-3 mb-3">
            <p className={`text-[13px] font-bold leading-tight transition-colors ${
              activeId === s.id ? 'text-white' : 'text-white/40 group-hover:text-white/80'
            }`}>
              {s.title}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-lg hover:text-destructive hover:bg-destructive/10 text-white/20 transition-all shrink-0"
              onClick={e => { e.stopPropagation(); onRemove(s.id); }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-white/20 uppercase tracking-tighter">
              <Clock className="w-3 h-3" />
              {s.created_at ? new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
            </div>
            <div className="flex gap-1">
              {s.tags?.slice(0, 2).map((tag, j) => (
                <span key={j} className="text-[8px] font-black text-primary/40 px-1.5 py-0.5 rounded-md bg-primary/5 uppercase tracking-tighter">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Subtle thumbnail hint */}
          <div className="absolute top-4 right-4 w-12 h-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity overflow-hidden rounded-lg rotate-12">
            <img src={s.thumbnail} alt="" className="w-full h-full object-cover grayscale" />
          </div>
        </div>
      ))}
    </div>
  );
}
