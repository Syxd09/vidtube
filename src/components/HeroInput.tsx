import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Youtube } from 'lucide-react';
import { extractVideoId } from '@/lib/youtube';
import { HeroScene } from '@/components/HeroScene';

interface HeroInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function HeroInput({ onSubmit, isLoading }: HeroInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    setError('');
    onSubmit(url);
  };

  return (
    <section className="relative py-24 sm:py-32 px-4 overflow-hidden min-h-[480px] flex items-center">
      {/* 3D Background */}
      <HeroScene />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background pointer-events-none" style={{ zIndex: 1 }} />

      <div className="relative max-w-2xl mx-auto text-center w-full" style={{ zIndex: 2, animation: 'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          AI-Powered Video Intelligence
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5 text-balance" style={{ lineHeight: '1.08' }}>
          Summarize any YouTube video{' '}
          <span className="text-primary">in seconds</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground mb-12 text-pretty max-w-lg mx-auto leading-relaxed">
          Paste a link. Get key points, timestamps, and a full searchable transcript — powered by AI.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={e => { setUrl(e.target.value); setError(''); }}
              className="pl-11 h-13 rounded-xl bg-surface-elevated/90 backdrop-blur-sm border-border/60 text-base shadow-lg shadow-black/5 focus-visible:ring-primary/40 focus-visible:shadow-xl focus-visible:shadow-primary/10 transition-shadow duration-300"
            />
          </div>
          <Button variant="hero" type="submit" disabled={isLoading || !url.trim()}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Summarize'}
          </Button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-destructive animate-fade-in">{error}</p>
        )}

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10 opacity-0" style={{ animation: 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards' }}>
          {['AI Summaries', 'Key Points', 'Transcript Search', 'Export'].map(feature => (
            <span key={feature} className="px-3 py-1 rounded-full text-xs font-medium text-muted-foreground bg-muted/60 backdrop-blur-sm border border-border/40">
              {feature}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
