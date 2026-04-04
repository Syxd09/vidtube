import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus, Trash2, Clock, Sparkles, Brain, Loader2, Target, Tag, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateContent } from "@/lib/ai-service";
import { toast } from "sonner";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  color: string;
  tag?: string;
  suggestion?: string;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const getAutoTag = (content: string) => {
  const c = content.toLowerCase();
  if (c.includes("fix") || c.includes("bug") || c.includes("code") || c.includes("api")) return "TECHNICAL";
  if (c.includes("plan") || c.includes("strategy") || c.includes("market") || c.includes("meeting")) return "STRATEGIC";
  if (c.includes("buy") || c.includes("cost") || c.includes("budget") || c.includes("price")) return "FINANCIAL";
  return "INTEL";
};

export default function NoteTracker() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("horizon-notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState("");
  const [noteProcessingId, setNoteProcessingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("horizon-notes", JSON.stringify(notes));
  }, [notes]);

  const cycleTag = (id: string) => {
    const TAGS = ["INTEL", "TECHNICAL", "STRATEGIC", "FINANCIAL"];
    setNotes(notes.map(n => {
      if (n.id !== id) return n;
      const currentIdx = TAGS.indexOf(n.tag || "INTEL");
      const nextTag = TAGS[(currentIdx + 1) % TAGS.length];
      return { ...n, tag: nextTag };
    }));
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes([{
      id: Date.now().toString(),
      content: newNote,
      createdAt: new Date().toISOString(),
      color: "border-l-primary",
      tag: getAutoTag(newNote)
    }, ...notes]);
    setNewNote("");
    setIsAdding(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const summarizeNote = async (id: string, content: string) => {
    setNoteProcessingId(id);
    try {
      const summary = await generateContent(`Summarize this note in one very short, tactical sentence: "${content}"`, "groq");
      if (summary) {
        setNotes(notes.map(n => n.id === id ? { ...n, content: summary, tag: getAutoTag(summary) } : n));
        toast.success("Intel summarized");
      }
    } catch (error) {
      toast.error("Summarization offline");
    } finally {
      setNoteProcessingId(null);
    }
  };

  const suggestActions = async (id: string, content: string) => {
    setIsSuggesting(id);
    try {
      const suggestion = await generateContent(`Based on this note: "${content}", suggest one specific next action. Keep it under 10 words.`, "google");
      if (suggestion) {
        setNotes(notes.map(n => n.id === id ? { ...n, suggestion } : n));
        toast.info(`Suggestion: ${suggestion}`, { duration: 5000 });
      }
    } catch (error) {
      toast.error("Suggestions offline");
    } finally {
      setIsSuggesting(null);
    }
  };

  const deployAsGoal = (note: Note) => {
    if (!note.suggestion) return;
    const savedGoals = JSON.parse(localStorage.getItem("horizon-goals") || "[]");
    const newGoal = {
      id: Date.now().toString(),
      title: note.suggestion,
      progress: 0,
      completed: false,
      milestones: [],
      priority: "Medium",
      category: "mechanic",
      time: "Now",
      context: `Extracted from intel: "${note.content}"`
    };
    localStorage.setItem("horizon-goals", JSON.stringify([newGoal, ...savedGoals]));
    window.dispatchEvent(new Event("storage"));
    toast.success("Intelligence deployed to objectives!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-10 space-y-8 flex flex-col min-h-[600px] bg-black/40 border border-white/10 backdrop-blur-3xl rounded-[3rem] shadow-2xl relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner group hover:border-primary/50 transition-all duration-500">
            <StickyNote className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Intelligence Briefs</h2>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#3b82f6]" />
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Neural Loop // Active</span>
            </div>
          </div>
        </div>
        <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] backdrop-blur-xl">
            {notes.length} Nodes Online
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div 
            key="adding"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4 rounded-3xl bg-white/[0.03] p-6 border border-white/10 shadow-2xl"
          >
            <Textarea
              placeholder="Inject tactical data stream..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="bg-transparent border-none focus-visible:ring-0 min-h-[120px] resize-none text-lg p-0 placeholder:text-white/10 text-white font-medium"
              autoFocus
            />
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <Button onClick={addNote} size="sm" className="h-10 px-6 rounded-xl bg-primary text-white hover:bg-primary/80 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">Authorize</Button>
              <Button onClick={() => { setIsAdding(false); setNewNote(""); }} size="sm" variant="ghost" className="h-10 px-6 text-white/20 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Abort</Button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="idle"
            layoutId="add-note-btn"
            onClick={() => setIsAdding(true)}
            className="w-full h-20 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[2rem] text-white/20 hover:text-white hover:border-primary/40 hover:bg-white/5 transition-all flex items-center justify-center gap-4 group"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 group-hover:text-primary" /> 
            </div>
            <span className="text-sm font-black uppercase tracking-[0.3em]">New Log Entry</span>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="space-y-6 flex-1 pr-2 custom-scrollbar overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {notes.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 mx-auto flex items-center justify-center">
                 <Brain className="w-8 h-8 text-white/10" />
              </div>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">No Intelligence Detected In Local Sector</p>
            </motion.div>
          ) : (
            notes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] relative hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-white leading-relaxed pr-12 tracking-tight">{note.content}</p>
                    <div className="flex items-center gap-4 text-white/30">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{timeAgo(note.createdAt)}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">Node_{note.id.slice(-4)}</span>
                    </div>
                  </div>
                  {note.tag && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); cycleTag(note.id); }}
                      className="text-[8px] font-black px-3 py-1.5 rounded-lg bg-primary/10 text-primary tracking-widest uppercase border border-primary/20 hover:bg-primary hover:text-white transition-all"
                    >
                      {note.tag}
                    </button>
                  )}
                </div>
                
                {note.suggestion && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between group/s"
                    >
                        <div className="flex items-center gap-3 pr-4 min-w-0">
                           <div className="p-1.5 rounded-lg bg-primary/20">
                             <Target className="w-3.5 h-3.5 text-primary" />
                           </div>
                           <p className="text-[11px] font-bold text-white/70 uppercase tracking-wide truncate italic">Proceed: {note.suggestion}</p>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deployAsGoal(note)}
                            className="h-8 w-8 rounded-xl bg-primary text-white hover:bg-primary/80 shadow-lg shadow-primary/20 transition-all"
                            title="Deploy to Mission Objectives"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-6 right-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => summarizeNote(note.id, note.content)}
                    disabled={noteProcessingId === note.id}
                    className="h-10 w-10 bg-white/5 border border-white/5 hover:border-emerald-500/50 hover:text-emerald-500 rounded-xl"
                  >
                    {noteProcessingId === note.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => suggestActions(note.id, note.content)}
                    disabled={isSuggesting === note.id}
                    className="h-10 w-10 bg-white/5 border border-white/5 hover:border-amber-500/50 hover:text-amber-500 rounded-xl"
                  >
                    {isSuggesting === note.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNote(note.id)}
                    className="h-10 w-10 bg-white/5 border border-white/5 hover:border-destructive/50 hover:text-white hover:bg-destructive/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
