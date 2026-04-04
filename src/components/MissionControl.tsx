import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  StickyNote, 
  Sparkles, 
  Edit3, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Zap, 
  ChevronRight, 
  Brain,
  Search,
  Clock,
  ArrowRight
} from 'lucide-react';
import { generateContent, refineGoal } from '@/lib/ai-service';
import { toast } from 'sonner';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  tag: string;
  isEditing?: boolean;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  completed: boolean;
  milestones: { id: string; text: string; done: boolean }[];
  context?: string;
}

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<'intel' | 'objectives'>('intel');
  const [notes, setNotes] = useState<Note[]>(() => JSON.parse(localStorage.getItem('cortex-notes') || '[]'));
  const [goals, setGoals] = useState<Goal[]>(() => JSON.parse(localStorage.getItem('cortex-goals') || '[]'));
  const [newNote, setNewNote] = useState('');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('cortex-notes', JSON.stringify(notes));
    localStorage.setItem('cortex-goals', JSON.stringify(goals));
  }, [notes, goals]);

  // --- Intel Logic ---
  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Math.random().toString(36).substr(2, 9),
      content: newNote,
      createdAt: new Date().toISOString(),
      tag: 'UNCODIFIED',
    };
    setNotes([note, ...notes]);
    setNewNote('');
    toast.success('Intelligence Node Logged');
  };

  const updateNote = (id: string, content: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content, isEditing: false } : n));
    toast.success('Intelligence Node Updated');
  };

  const convertToGoal = async (note: Note) => {
    setIsGenerating(note.id);
    try {
      const summary = await generateContent(`Convert this note into a high-impact mission title: "${note.content}"`);
      const goal: Goal = {
        id: Math.random().toString(36).substr(2, 9),
        title: summary || note.content,
        progress: 0,
        completed: false,
        milestones: [],
        context: note.content
      };
      setGoals([goal, ...goals]);
      setActiveTab('objectives');
      toast.success('Mission Tactical Parameters Initialized');
    } catch {
      toast.error('Mission Initialization Failed');
    } finally {
      setIsGenerating(null);
    }
  };

  // --- Goals Logic ---
  const generateRoadmap = async (goal: Goal) => {
    setIsGenerating(goal.id);
    try {
      const refined = await refineGoal(goal.title);
      if (refined && refined.milestones) {
        setGoals(goals.map(g => g.id === goal.id ? { 
          ...g, 
          milestones: refined.milestones.map((m: string) => ({ id: Math.random().toString(36).substr(2, 9), text: m, done: false })),
          context: refined.context 
        } : g));
        toast.success('Strategic Roadmap Deployed');
      }
    } catch {
      toast.error('Strategic Deployment Failed');
    } finally {
      setIsGenerating(null);
    }
  };

  const toggleMilestone = (goalId: string, mid: string) => {
    setGoals(goals.map(g => {
        if (g.id !== goalId) return g;
        const updated = g.milestones.map(m => m.id === mid ? { ...m, done: !m.done } : m);
        const progress = Math.round((updated.filter(m => m.done).length / updated.length) * 100);
        return { ...g, milestones: updated, progress };
    }));
  };

  return (
    <div className="flex flex-col h-full bg-[#030303]/40 selection:bg-primary/20">
      {/* 1. Dashboard Header */}
      <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between backdrop-blur-3xl">
        <div className="flex items-center gap-6">
          <div className="flex gap-2 p-1 rounded-2xl bg-white/5 border border-white/5">
            {[
                { id: 'intel', label: 'Tactical Intel', icon: StickyNote },
                { id: 'objectives', label: 'Mission Board', icon: Target }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${
                        activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/30 hover:text-white'
                    }`}
                >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
            {activeTab === 'intel' && (
                <div className="relative group">
                    <input 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addNote()}
                        placeholder="Establish New Intelligence Node..."
                        className="w-80 h-11 bg-white/5 border border-white/10 rounded-xl px-5 text-[11px] font-bold text-white placeholder:text-white/20 outline-none focus:border-primary/40 focus:bg-white/[0.08] transition-all"
                    />
                    <button onClick={addNote} className="absolute right-2 top-1.5 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* 2. Main Terminal Screens */}
      <div className="flex-1 overflow-auto p-12 custom-scrollbar relative">
        {/* Subtle Background Scanline for this module */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0" />

        <div className="max-w-6xl mx-auto h-full relative z-10">
            <AnimatePresence mode="wait">
                {activeTab === 'intel' ? (
                    <motion.div 
                        key="intel"
                        initial={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {notes.map((note) => (
                            <motion.div 
                                key={note.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-primary/40 hover:bg-white/[0.06] transition-all group relative overflow-hidden shadow-2xl"
                            >
                                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-primary/5 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
                                
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="text-[9px] font-black text-primary px-3 py-1 rounded-md bg-primary/10 border border-primary/20 uppercase tracking-widest leading-none">
                                        Node // Sync
                                    </span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setNotes(notes.map(n => n.id === note.id ? { ...n, isEditing: true } : n))} className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white">
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => setNotes(notes.filter(n => n.id !== note.id))} className="p-2 rounded-lg hover:bg-destructive/10 text-white/30 hover:text-destructive">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {note.isEditing ? (
                                    <div className="space-y-4 relative z-10">
                                        <textarea
                                            defaultValue={note.content}
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && e.ctrlKey) updateNote(note.id, (e.target as HTMLTextAreaElement).value);
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-medium text-white/80 h-32 outline-none focus:border-primary/40"
                                        />
                                        <div className="flex justify-between items-center">
                                            <span className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-mono italic">Ctrl+Enter Commit</span>
                                            <button 
                                                onClick={() => {
                                                   const area = document.querySelector('textarea') as HTMLTextAreaElement;
                                                   updateNote(note.id, area.value);
                                                }}
                                                className="px-5 py-2 rounded-lg bg-primary text-white text-[10px] font-black uppercase shadow-lg shadow-primary/20"
                                            >Commit</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm font-bold text-white/80 leading-relaxed mb-6 pr-4 relative z-10">{note.content}</p>
                                )}

                                <div className="flex items-center justify-between border-t border-white/5 pt-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-white/20" />
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">
                                            {new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => convertToGoal(note)}
                                        disabled={isGenerating === note.id}
                                        className="h-8 pr-4 pl-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/10 text-white/30 hover:text-primary transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-sm"
                                    >
                                        {isGenerating === note.id ? <Zap className="w-3 h-3 animate-spin" /> : <Target className="w-3 h-3" />}
                                        Deploy Unit
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="objectives"
                        initial={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="space-y-12 pb-20"
                    >
                        {goals.length === 0 && (
                            <div className="py-32 text-center opacity-20">
                                <Target className="w-16 h-16 mx-auto mb-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em]">No Strategic Objectives Active</span>
                            </div>
                        )}
                        {goals.map((goal) => (
                            <motion.div 
                                key={goal.id} 
                                initial={{ scale: 0.98, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`p-10 rounded-[3rem] bg-white/[0.03] border backdrop-blur-3xl relative overflow-hidden group shadow-2xl transition-all duration-500 ${
                                    !goal.completed ? 'border-primary/20 shadow-[0_0_50px_-20px_rgba(59,130,246,0.3)]' : 'border-white/5'
                                }`}
                            >
                                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                {/* Breathing Pulse Effect for active missions */}
                                {!goal.completed && (
                                    <div className="absolute inset-0 border border-primary/20 rounded-[3rem] animate-pulse pointer-events-none" />
                                )}

                                <div className="flex items-start justify-between relative z-10 mb-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                                <Target className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic glitch-text-hover">{goal.title}</h3>
                                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">MISSION_ID: {goal.id}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest">
                                                Status: {goal.completed ? 'TERMINATED_OK' : 'ACTIVE_DEPLOYMENT'}
                                            </div>
                                            <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                                INTEGRITY: {goal.progress}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => generateRoadmap(goal)}
                                            disabled={isGenerating === goal.id}
                                            className="h-12 px-8 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
                                        >
                                            {isGenerating === goal.id ? <Zap className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                                            Generate AI Roadmap
                                        </button>
                                        <button 
                                            onClick={() => setGoals(goals.filter(g => g.id !== goal.id))}
                                            className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-destructive hover:border-destructive/30 transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Dynamic Roadmap Visualization */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <ArrowRight className="w-4 h-4 text-primary" />
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Tactical Objectives</span>
                                        </div>
                                        <div className="space-y-4">
                                            {goal.milestones.map((milestone) => (
                                                <motion.button
                                                    key={milestone.id}
                                                    onClick={() => toggleMilestone(goal.id, milestone.id)}
                                                    whileHover={{ x: 5 }}
                                                    className={`w-full p-5 rounded-2xl border transition-all flex items-center justify-between group/m ${
                                                        milestone.done 
                                                        ? 'bg-emerald-500/5 border-emerald-500/30' 
                                                        : 'bg-white/5 border-white/5 hover:border-primary/40'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                                                            milestone.done ? 'bg-emerald-500 border-none' : 'border-white/10 group-hover/m:border-primary'
                                                        }`}>
                                                            {milestone.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                        </div>
                                                        <span className={`text-[11px] font-bold uppercase tracking-wide text-left ${
                                                            milestone.done ? 'text-white/40 line-through' : 'text-white/80'
                                                        }`}>{milestone.text}</span>
                                                    </div>
                                                    <ChevronRight className={`w-4 h-4 transition-all opacity-0 group-hover/m:opacity-100 ${
                                                        milestone.done ? 'text-emerald-500' : 'text-primary'
                                                    }`} />
                                                </motion.button>
                                            ))}
                                            {goal.milestones.length === 0 && (
                                                <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl text-center">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">No Tactical Data // Request AI Deployment.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Zap className="w-4 h-4 text-primary" />
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Mission Intelligence</span>
                                        </div>
                                        <div className="p-8 rounded-[2.5rem] bg-black/40 border border-white/5 h-full min-h-[200px] shadow-inner relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.05] bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px] z-0" />
                                            <p className="text-xs font-medium text-white/40 leading-relaxed uppercase tracking-tighter whitespace-pre-wrap relative z-10 selection:bg-primary/30">
                                                {goal.context || 'Strategic context for this mission is pending. AI refinement recommended for maximum efficiency.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar Bottom */}
                                <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full">
                                    <motion.div 
                                        className="h-full bg-primary shadow-[0_0_15px_#3b82f6]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${goal.progress}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
