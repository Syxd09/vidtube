import { useState, useEffect, useRef, useMemo } from 'react';
import { IntelligenceBar, IntelligenceBarHandle } from '@/components/IntelligenceBar';
import { SummaryPanel } from '@/components/SummaryPanel';
import { TranscriptViewer } from '@/components/TranscriptViewer';
import { AIChatPanel } from '@/components/AIChatPanel';
import { MainLayout } from '@/components/MainLayout';
import { AIStatusBar } from '@/components/AIStatusBar';
import { AnalyticsView } from '@/components/AnalyticsView';
import { DocumentsView } from '@/components/DocumentsView';
import { SettingsView } from '@/components/SettingsView';
import { DiscoveryView } from '@/components/DiscoveryView';
import { useSummaries } from '@/hooks/useSummaries';
import { extractVideoId, getYoutubeThumbnail } from '@/lib/youtube';
import type { SummaryData } from '@/lib/youtube';
import { fetchTranscript, fetchVideoMetadata } from '@/lib/transcript-fetcher';
import { summarizeVideo, generateTags } from '@/lib/ai-service';
import { setOnProviderSwitch } from '@/lib/ai-providers';
import { toast } from 'sonner';
import { CortexLogo } from './CortexLogo';
import { 
  Zap, Brain, MessageSquare, FileText, Sparkles, 
  ArrowRight, Globe, Loader2, Library, Settings as SettingsIcon,
  Search, Trash2, Clock, Play
} from 'lucide-react';

type Tab = 'summary' | 'chat' | 'transcript';
type ViewMode = 'workspace' | 'library' | 'analytics' | 'docs' | 'settings' | 'discovery';

export default function IntelligenceApp() {
  const { summaries, save, remove } = useSummaries();
  const [viewMode, setViewMode] = useState<ViewMode>('workspace');
  const [currentSummary, setCurrentSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [switchMessage, setSwitchMessage] = useState('');
  const [aiProvider, setAiProvider] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SummaryData[]>([]);
  
  const barRef = useRef<IntelligenceBarHandle>(null);

  // Listen for provider switches
  useEffect(() => {
    setOnProviderSwitch((from, to) => {
      const msg = `Switched: ${from} → ${to}`;
      setSwitchMessage(msg);
      toast.info(`🔄 AI Provider switched: ${to}`, { duration: 4000 });
      setTimeout(() => setSwitchMessage(''), 5000);
    });
  }, []);

  const handleSubmit = async (input: string | File) => {
    if (typeof input === 'string') {
      const videoId = extractVideoId(input);
      if (!videoId) return;

      setViewMode('workspace');
      setIsLoading(true);
      setLoadingStep('Initializing Intelligence...');
      setActiveTab('summary');

      try {
        setLoadingStep('Fetching metadata...');
        const metadata = await fetchVideoMetadata(videoId);

        setLoadingStep('Extracting transcript...');
        const transcript = await fetchTranscript(videoId);

        setLoadingStep('Deep AI analysis...');
        const fullText = transcript.map(t => t.text).join(' ');
        const result = await summarizeVideo(fullText, metadata.title);

        setAiProvider(result.provider);
        setAiModel(result.model);

        setLoadingStep('Generating smart tags...');
        let tags: string[] = [];
        try {
          tags = await generateTags(result.summary, metadata.title);
        } catch { /* skip */ }

        const summary: SummaryData = {
          id: videoId + '-' + Date.now(),
          video_id: videoId,
          title: metadata.title,
          author_name: metadata.authorName || 'Unknown Author',
          thumbnail: getYoutubeThumbnail(videoId),
          summary: result.summary,
          overview: result.overview,
          key_points: result.keyPoints,
          sentiment: result.sentiment,
          transcript,
          tags,
          views: metadata.views,
          publish_date: metadata.publishDate,
          created_at: new Date().toISOString(),
        };

        setCurrentSummary(summary);
        setSessionHistory(prev => {
          const filtered = prev.filter(s => s.video_id !== summary.video_id);
          return [summary, ...filtered].slice(0, 5);
        });
        toast.success('Analysis complete');
      } catch (err: any) {
        console.error(err);
        setLoadingStep('error');
        toast.error(err.message || 'Analysis failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      // HANDLE LOCAL FILE
      const file = input;
      setLocalFile(file);
      setViewMode('workspace');
      setIsLoading(true);
      setLoadingStep('Compressing & Uploading...');
      setActiveTab('summary');

      try {
        const { uploadToR2 } = await import('@/lib/storage');
        const { extractAudio } = await import('@/lib/video-worker');

        setLoadingStep('Scanning video bits...');
        const fileKey = `uploads/${Date.now()}-${file.name}`;
        
        // Background upload to R2
        const uploadPromise = uploadToR2(file, fileKey);

        setLoadingStep('Extracting audio core (WASM)...');
        const audioBlob = await extractAudio(file);
        
        setLoadingStep('AI Speech Recognition (Whisper)...');
        const formData = new FormData();
        formData.append('file', audioBlob);

        const transcribeRes = await fetch('/api/ai/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!transcribeRes.ok) throw new Error('Transcription failed');
        const transcription = await transcribeRes.json();
        
        // Construct summary from transcription
        setLoadingStep('Deep AI analysis...');
        const fullText = transcription.text;
        const result = await summarizeVideo(fullText, file.name);

        setAiProvider(result.provider);
        setAiModel(result.model);

        const mockSummary: SummaryData = {
          id: 'local-' + Date.now(),
          video_id: 'local',
          title: file.name,
          author_name: 'Local Upload',
          thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
          summary: result.summary,
          overview: result.overview,
          key_points: result.keyPoints,
          sentiment: result.sentiment,
          transcript: transcription.segments?.map((s: any) => ({
            text: s.text,
            start: s.start,
            duration: s.end - s.start
          })) || [{ text: fullText, start: 0, duration: 10 }],
          tags: ['Local', 'Transcription', 'AI'],
          created_at: new Date().toISOString(),
        };

        await uploadPromise; // Wait for R2 upload if not finished
        setCurrentSummary(mockSummary);
        toast.success('Local video analyzed successfully');
      } catch (err: any) {
        console.error(err);
        setLoadingStep('error');
        toast.error('Local processing failed: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isSaved = currentSummary ? summaries.some(s => s.video_id === currentSummary.video_id) : false;

  // Unified list for Recents in Sidebar
  const recents = useMemo(() => {
    const combined = [...sessionHistory, ...summaries];
    const unique = new Map<string, SummaryData>();
    combined.forEach(s => {
      if (!unique.has(s.video_id)) {
        unique.set(s.video_id, s);
      }
    });
    return Array.from(unique.values())
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5);
  }, [summaries, sessionHistory]);

  const filteredSummaries = useMemo(() => {
    if (!searchQuery) return summaries;
    return summaries.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [summaries, searchQuery]);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'transcript', label: 'Transcript', icon: FileText },
  ];

  const handleQuickAction = (action: string) => {
    toast.info(`Ready for ${action}. Paste a link below.`);
    barRef.current?.focus();
    barRef.current?.setValue(""); 
  };

  const renderWorkspace = () => (
    <div className="flex flex-col min-h-full pb-32">
      <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-white/[0.01] backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">
              Terminal
            </h2>
            <span className="text-sm font-bold text-white tracking-tight">
              {currentSummary ? 'Active Analysis' : 'Intelligence Home'}
            </span>
          </div>
        </div>
        <AIStatusBar lastSwitchMessage={switchMessage} />
      </div>

      <div className="flex-1 p-8">
        {!currentSummary && !isLoading && (
          <div className="max-w-4xl mx-auto pt-16 animate-fade-up">
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                <CortexLogo size={12} className="text-primary" />
                Intelligence Active
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                Cortex <span className="text-primary italic">Intelligence</span>
              </h1>
              <p className="text-white/40 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                Choose a capability or paste a URL below to begin your deep analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16 px-4 sm:px-0">
              {[
                { icon: Brain, label: 'Deep Summary', desc: 'Conceptual soul extraction', color: 'from-blue-500/20 to-indigo-500/20' },
                { icon: MessageSquare, label: 'Semantic Chat', desc: 'Direct content interrogation', color: 'from-emerald-500/20 to-teal-500/20' },
                { icon: Zap, label: 'Key Takeaways', desc: 'High-value strategic points', color: 'from-amber-500/20 to-orange-500/20' },
                { icon: Globe, label: 'Social Insights', desc: 'Deduce community resonance', color: 'from-purple-500/20 to-pink-500/20' },
              ].map((card) => (
                <button 
                  key={card.label} 
                  onClick={() => handleQuickAction(card.label)}
                  className={`group relative p-8 rounded-[32px] bg-gradient-to-br ${card.color} border border-white/5 hover:border-primary/50 hover:bg-white/[0.04] transition-all duration-500 text-left overflow-hidden shadow-2xl hover:shadow-primary/10`}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                    <card.icon className="w-24 h-24" />
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{card.label}</h3>
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-tighter">{card.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="max-w-2xl mx-auto py-32 text-center animate-fade-in">
            <div className="inline-flex items-center gap-6 px-10 py-8 rounded-[40px] bg-[#0A0A0A]/80 border border-white/5 backdrop-blur-3xl shadow-[0_0_100px_-20px_rgba(0,106,255,0.3)]">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <Zap className="absolute inset-0 m-auto w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-white font-black text-xs uppercase tracking-[0.2em]">{loadingStep || 'Synchronizing Intelligence...'}</p>
                <p className="text-white/20 text-[10px] font-bold mt-1 uppercase tracking-widest">Multi-Model AI Extraction // Active</p>
              </div>
            </div>
          </div>
        )}

        {currentSummary && !isLoading && (
          <div className="max-w-5xl mx-auto space-y-10 animate-fade-up">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/5 w-fit mx-auto sticky top-4 z-40 backdrop-blur-xl shadow-2xl">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow-xl shadow-primary/20'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-12">
              {activeTab === 'summary' && (
                <SummaryPanel
                  data={currentSummary}
                  onSave={save}
                  isSaved={isSaved}
                  aiProvider={aiProvider}
                  aiModel={aiModel}
                  onSwitchToChat={() => setActiveTab('chat')}
                />
              )}
              {activeTab === 'chat' && (
                <AIChatPanel
                  transcript={currentSummary.transcript}
                  title={currentSummary.title}
                  videoId={currentSummary.video_id}
                />
              )}
              {activeTab === 'transcript' && (
                <TranscriptViewer 
                  transcript={currentSummary.transcript || []} 
                  videoId={currentSummary.video_id}
                  title={currentSummary.title}
                  videoFile={localFile}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-[260px] right-0 xl:right-[320px] bg-gradient-to-t from-[#030303] via-[#030303] to-transparent pt-32 pb-4 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <IntelligenceBar ref={barRef} onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="flex flex-col min-h-full p-8 animate-fade-up">
      <div className="max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Knowledge Management</h2>
            <h1 className="text-4xl font-black text-white tracking-tighter">Your Intelligence Vault</h1>
          </div>
          <div className="relative group min-w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="Search your knowledge..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-semibold text-white placeholder:text-white/20 outline-none focus:border-primary/30 transition-all"
            />
          </div>
        </header>

        {filteredSummaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.01] border border-white/5 rounded-[40px]">
            <Library className="w-16 h-16 text-white/5 mb-6" />
            <p className="text-xl font-bold text-white/20 uppercase tracking-widest">
              {searchQuery ? 'No matching results' : 'Your vault is empty'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSummaries.map((s, i) => (
              <div 
                key={s.id}
                className="group relative flex flex-col bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-500 shadow-2xl"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img src={s.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <button 
                    onClick={() => { setCurrentSummary(s); setViewMode('workspace'); setActiveTab('summary'); }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                      <Play className="w-6 h-6 text-white fill-current" />
                    </div>
                  </button>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                      <Clock className="w-3 h-3" />
                      {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight line-clamp-2">{s.title}</h3>
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {s.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] font-black text-primary/60 px-2 py-1 rounded-lg bg-primary/5 uppercase tracking-tighter">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); remove(s.id); }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 hover:text-destructive hover:border-destructive/50 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <MainLayout
      summaries={recents} // Passing MERGED recents for sidebar
      currentSummary={currentSummary}
      onSelectSummary={(s) => { setCurrentSummary(s); setViewMode('workspace'); setActiveTab('summary'); }}
      onRemoveSummary={(id) => {
        remove(id);
        setSessionHistory(prev => prev.filter(s => s.id !== id));
      }}
      onHome={() => { setViewMode('workspace'); setCurrentSummary(null); toast.success('Workspace reset'); }}
      onSearch={(query) => { 
        if (query) {
          setSearchQuery(query);
          setViewMode('library');
        } else {
          barRef.current?.focus();
        }
      }}
      onLibrary={() => setViewMode('library')}
      onAnalytics={() => setViewMode('analytics')}
      onDocuments={() => setViewMode('docs')}
      onDiscovery={() => setViewMode('discovery')}
      onSettings={() => setViewMode('settings')}
      activeView={viewMode}
    >
      {viewMode === 'workspace' && renderWorkspace()}
      {viewMode === 'library' && renderLibrary()}
      {viewMode === 'analytics' && <AnalyticsView summaries={summaries} />}
      {viewMode === 'docs' && <DocumentsView summaries={summaries} onSelect={(s) => { setCurrentSummary(s); setViewMode('workspace'); setActiveTab('summary'); }} />}
      {viewMode === 'settings' && <SettingsView />}
      {viewMode === 'discovery' && <DiscoveryView onAnalyze={handleSubmit} />}
    </MainLayout>
  );
}
