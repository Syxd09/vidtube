import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, ArrowRight, Paperclip, Mic, Sparkle } from 'lucide-react';
import { extractVideoId } from '@/lib/youtube';
import { getActiveProvider } from '@/lib/ai-providers';
import { toast } from 'sonner';

interface IntelligenceBarProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export interface IntelligenceBarHandle {
  focus: () => void;
  setValue: (val: string) => void;
}

export const IntelligenceBar = forwardRef<IntelligenceBarHandle, IntelligenceBarProps>(
  ({ onSubmit, isLoading }, ref) => {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const activeProvider = getActiveProvider();

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      setValue: (val: string) => {
        setUrl(val);
      }
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const videoId = extractVideoId(url);
      if (!videoId) {
        setError('Invalid YouTube URL');
        toast.error('Please enter a valid YouTube link');
        return;
      }
      setError('');
      onSubmit(url);
      setUrl(''); 
    };

    return (
      <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-focus-within:opacity-30" />
          
          <form 
            onSubmit={handleSubmit} 
            className="relative flex flex-col gap-2 p-2 rounded-2xl bg-[#0F0F0F] border border-white/5 shadow-2xl focus-within:border-primary/30 transition-all duration-500"
          >
            <div className="flex items-center gap-2 px-2 pt-1">
              <input
                ref={inputRef}
                type="text"
                placeholder="Summarize the latest YouTube video..."
                value={url}
                onChange={e => { setUrl(e.target.value); setError(''); }}
                className="flex-1 bg-transparent border-none outline-none text-white text-sm py-2 px-2 placeholder:text-white/20 focus:ring-0"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !url.trim()} 
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl hover:bg-white/5 text-white/40 hover:text-primary transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between px-2 pb-1 border-t border-white/5 pt-2">
              <div className="flex items-center gap-1">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toast.info('File attachment coming soon')}
                  className="h-8 px-2 text-[10px] font-black text-white/30 hover:text-white hover:bg-white/5 gap-1.5 uppercase tracking-tighter transition-all"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  Attach
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toast.info('Voice input coming soon')}
                  className="h-8 px-2 text-[10px] font-black text-white/30 hover:text-white hover:bg-white/5 gap-1.5 uppercase tracking-tighter transition-all"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Voice
                </Button>
                <div className="h-4 w-[1px] bg-white/5 mx-1" />
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toast.info('Prompt library coming soon')}
                  className="h-8 px-2 text-[10px] font-black text-primary gap-1.5 uppercase tracking-tighter transition-all hover:bg-primary/5"
                >
                  <Sparkle className="w-3.5 h-3.5" />
                  Browse Prompts
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.1em]">
                  {url.length} / 500
                </span>
                <div className="h-4 w-[1px] bg-white/5 mx-1" />
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                  <Zap className="w-3 h-3 text-primary shadow-glow-primary" />
                  {activeProvider?.name}
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {error && (
          <p className="mt-2 text-[10px] text-destructive font-black uppercase tracking-widest text-center animate-fade-in">{error}</p>
        )}

        <p className="mt-3 text-[9px] text-white/10 font-medium text-center uppercase tracking-[0.1em]">
          VidTube AI may generate inaccurate info about people, places, or facts. Model: {activeProvider?.name} v2.4
        </p>
      </div>
    );
  }
);

IntelligenceBar.displayName = 'IntelligenceBar';
