import { useState } from 'react';
import { HeroInput } from '@/components/HeroInput';
import { SummaryPanel } from '@/components/SummaryPanel';
import { TranscriptViewer } from '@/components/TranscriptViewer';
import { SavedSummaries } from '@/components/SavedSummaries';
import { useSummaries } from '@/hooks/useSummaries';
import { extractVideoId, getYoutubeThumbnail } from '@/lib/youtube';
import type { SummaryData } from '@/lib/youtube';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';

export default function Index() {
  const [currentSummary, setCurrentSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { summaries, save, remove } = useSummaries();

  const handleSubmit = async (url: string) => {
    const videoId = extractVideoId(url);
    if (!videoId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('summarize', {
        body: { videoId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const summary: SummaryData = {
        id: videoId + '-' + Date.now(),
        videoId,
        title: data.title,
        thumbnail: getYoutubeThumbnail(videoId),
        summary: data.summary,
        keyPoints: data.keyPoints,
        transcript: data.transcript,
        createdAt: new Date().toISOString(),
        tags: [],
      };

      setCurrentSummary(summary);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to summarize video');
    } finally {
      setIsLoading(false);
    }
  };

  const isSaved = currentSummary ? summaries.some(s => s.videoId === currentSummary.videoId) : false;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
              <Zap className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">TubeDigest</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden sm:block">AI Video Summarizer</p>
            {summaries.length > 0 && (
              <span className="text-xs tabular-nums px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {summaries.length} saved
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hero / Input */}
      <HeroInput onSubmit={handleSubmit} isLoading={isLoading} />

      {/* Content */}
      {(currentSummary || summaries.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-[1fr_340px] gap-10">
            {/* Main content */}
            <div className="space-y-8">
              {currentSummary && (
                <>
                  <SummaryPanel data={currentSummary} onSave={save} isSaved={isSaved} />
                  <TranscriptViewer transcript={currentSummary.transcript} videoId={currentSummary.videoId} />
                </>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <SavedSummaries
                summaries={summaries}
                onSelect={setCurrentSummary}
                onRemove={remove}
                activeId={currentSummary?.id}
              />
            </aside>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-5 rounded-2xl bg-card border border-border/40 shadow-2xl shadow-primary/5" style={{ animation: 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <div className="relative">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 w-6 h-6 border-2 border-primary/20 rounded-full" />
            </div>
            <div className="text-left">
              <p className="text-foreground font-medium text-sm">Analyzing video...</p>
              <p className="text-muted-foreground text-xs mt-0.5">Fetching transcript & generating AI summary</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
