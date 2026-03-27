import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { chatWithTranscript } from '@/lib/ai-service';
import type { ChatMessage } from '@/lib/ai-providers';
import type { TranscriptEntry } from '@/lib/youtube';

interface AIChatPanelProps {
  transcript: TranscriptEntry[];
  title: string;
  videoId: string;
}

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
}

export function AIChatPanel({ transcript, title, videoId }: AIChatPanelProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const transcriptText = transcript.map(t => t.text).join(' ');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setIsLoading(true);

    try {
      // Build history for context (last 6 messages)
      const history: ChatMessage[] = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const result = await chatWithTranscript(transcriptText, title, question, history);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.answer,
        provider: result.provider,
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}`,
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const submitQuestion = async (q: string) => {
    if (isLoading) return;
    setInput(''); // Clear input before history update if needed
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setIsLoading(true);

    try {
      const history: ChatMessage[] = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const result = await chatWithTranscript(transcriptText, title, q, history);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.answer,
        provider: result.provider,
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    'What are the main topics discussed?',
    'Summarize the key arguments',
    'What conclusions were drawn?',
    'Any controversial points mentioned?',
  ];

  return (
    <div className="flex flex-col h-[520px] glass-strong rounded-2xl overflow-hidden glow-primary">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/30">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Chat with Video</h3>
          <p className="text-[11px] text-muted-foreground">Ask anything about this video</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-primary/60" />
            </div>
            <p className="text-sm text-muted-foreground mb-5">Ask a question about the video</p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => submitQuestion(q)}
                  className="text-left text-xs px-3 py-2 rounded-xl bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground border border-border/30 transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animation: `fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s both` }}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted/50 text-foreground border border-border/30 rounded-bl-md'
                }`}>
                  <div className="ai-markdown whitespace-pre-wrap">{msg.content}</div>
                  {msg.provider && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5 select-none">via {msg.provider}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-accent" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-muted/50 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: 'typing-dot 1.2s ease-in-out infinite 0s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: 'typing-dot 1.2s ease-in-out infinite 0.2s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: 'typing-dot 1.2s ease-in-out infinite 0.4s' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border/30">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about the video..."
            className="flex-1 h-10 bg-muted/30 border-border/30 rounded-xl text-sm focus-visible:ring-primary/30"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
