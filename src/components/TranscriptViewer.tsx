import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Clock, Play, Download, Music, Loader2, FileText, Globe } from 'lucide-react';
import type { TranscriptEntry } from '@/lib/youtube';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportToSRT, exportToVTT, downloadFile } from '@/lib/export-utils';
import { generateDub } from '@/lib/dubbing-service';
import { mergeAudio } from '@/lib/video-worker';
import { translateTranscript } from '@/lib/ai-service';

interface TranscriptViewerProps {
  transcript: TranscriptEntry[];
  videoId: string;
  title?: string;
  videoFile?: File | null;
}

export const TranscriptViewer = ({ transcript, videoId, title, videoFile }: TranscriptViewerProps) => {
  const [search, setSearch] = useState('');
  const [isDubbing, setIsDubbing] = useState(false);
  const [targetLang, setTargetLang] = useState('hi');
  const [translatedTranscript, setTranslatedTranscript] = useState<TranscriptEntry[] | null>(null);

  const languages = [
    { code: 'hi', label: 'Hindi' },
    { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' },
    { code: 'bn', label: 'Bengali' },
    { code: 'mr', label: 'Marathi' },
    { code: 'kn', label: 'Kannada' },
    { code: 'gu', label: 'Gujarati' },
    { code: 'ml', label: 'Malayalam' },
  ];

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

  const handleExport = (type: 'srt' | 'vtt') => {
    const data = translatedTranscript || transcript;
    const content = type === 'srt' ? exportToSRT(data) : exportToVTT(data);
    const filename = `${title || 'transcript'}_${targetLang}.${type}`;
    const mime = type === 'srt' ? 'text/plain' : 'text/vtt';
    downloadFile(content, filename, mime);
    toast.success(`Exported ${targetLang.toUpperCase()} to ${type.toUpperCase()}`);
  };

  const handleDub = async () => {
    setIsDubbing(true);
    const langLabel = languages.find(l => l.code === targetLang)?.label || targetLang;
    toast.loading(`Translating and synthesizing ${langLabel} dub...`, { id: 'dub' });
    
    try {
      // 1. Translate
      const translated = await translateTranscript(transcript, langLabel);
      setTranslatedTranscript(translated);
      
      // 2. Synthesize
      const fullText = translated.map(t => t.text).join(' ');
      const audioBlob = await generateDub({ text: fullText, languageCode: targetLang });
      
      // 3. Merge or Export
      if (videoFile) {
        toast.loading(`Merging ${langLabel} audio (FFmpeg WASM)...`, { id: 'dub' });
        const dubbedVideoBlob = await mergeAudio(videoFile, audioBlob);
        downloadFile(URL.createObjectURL(dubbedVideoBlob), `${title || 'video'}_${targetLang}.mp4`, 'video/mp4');
        toast.success(`Dubbed video (${langLabel}) ready!`, { id: 'dub' });
      } else {
        downloadFile(URL.createObjectURL(audioBlob), `${title || 'audio'}_${targetLang}.mp3`, 'audio/mp3');
        toast.success(`AI voiceover (${langLabel}) generated!`, { id: 'dub' });
      }
    } catch (err: any) {
      toast.error(`Dubbing failed: ${err.message}`, { id: 'dub' });
    } finally {
      setIsDubbing(false);
    }
  };

  const currentDisplay = translatedTranscript || filtered;

  return (
    <ScrollReveal delay={0.2}>
      <Card className="glass-strong overflow-hidden relative hover:shadow-xl transition-all duration-500">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/60 to-transparent rounded-l-lg" />
        <div className="p-5 border-b border-border/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Transcript</h3>
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-muted/50 border-border/30 rounded-lg text-[10px] font-black uppercase tracking-widest px-2 py-1 outline-none focus:border-primary/50 transition-colors"
                disabled={isDubbing}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-[#030303] text-white">{lang.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleExport('srt')} className="h-8 px-2 text-[10px] font-bold">SRT</Button>
                <Button variant="ghost" size="sm" onClick={() => handleExport('vtt')} className="h-8 px-2 text-[10px] font-bold">VTT</Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  disabled={isDubbing}
                  onClick={handleDub}
                  className="h-8 gap-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
                >
                  {isDubbing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Music className="w-3 h-3" />}
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Dub</span>
                </Button>
              </div>
            </div>
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
            {translatedTranscript && (
              <div className="px-3 py-2 mb-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between animate-fade-down">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  Showing {languages.find(l => l.code === targetLang)?.label} translation
                </p>
                <button 
                  onClick={() => setTranslatedTranscript(null)}
                  className="text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors"
                >
                  Reset to English
                </button>
              </div>
            )}
            {currentDisplay.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No matching segments</p>
            ) : (
              currentDisplay.map((entry, i) => (
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
