import { Sparkles, Brain, Route, ChevronRight, Zap, Loader2, Target, StickyNote, Plus, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDailyMission, generateContent } from "@/lib/ai-service";
import { toast } from "sonner";

export default function AISummary() {
  const [briefing, setBriefing] = useState<string | null>(() => localStorage.getItem("horizon-briefing"));
  const [roadmap, setRoadmap] = useState<string | null>(() => localStorage.getItem("horizon-roadmap"));
  const [isLoading, setIsLoading] = useState(false);
  const [isBuildingRoadmap, setIsBuildingRoadmap] = useState(false);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [commandInput, setCommandInput] = useState("");
  const [history, setHistory] = useState<any[]>(() => JSON.parse(localStorage.getItem("horizon-intel-history") || "[]"));
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const updateGoals = () => {
      const saved = JSON.parse(localStorage.getItem("horizon-goals") || "[]");
      const active = saved.filter((g: any) => !g.completed);
      setActiveGoals(active);
    };
    updateGoals();
    window.addEventListener("storage", updateGoals);
    return () => window.removeEventListener("storage", updateGoals);
  }, []);

  const saveToHistory = (type: 'briefing' | 'roadmap', content: string) => {
    const entry = {
      id: Date.now().toString(),
      type,
      content,
      date: new Date().toISOString(),
      focus: activeGoals.filter(g => selectedGoalIds.includes(g.id)).map(g => g.title)
    };
    const newHistory = [entry, ...history].slice(0, 20); // Keep last 20
    setHistory(newHistory);
    localStorage.setItem("horizon-intel-history", JSON.stringify(newHistory));
  };

  useEffect(() => {
    if (briefing) localStorage.setItem("horizon-briefing", briefing);
    else localStorage.removeItem("horizon-briefing");
  }, [briefing]);

  useEffect(() => {
    if (roadmap) localStorage.setItem("horizon-roadmap", roadmap);
    else localStorage.removeItem("horizon-roadmap");
  }, [roadmap]);

  const fetchBriefing = async () => {
    setIsLoading(true);
    try {
      const savedNotes = JSON.parse(localStorage.getItem("horizon-notes") || "[]");
      const selectedGoals = activeGoals.filter(g => selectedGoalIds.includes(g.id)).map(g => g.title);
      const goalsToUse = selectedGoals.length > 0 ? selectedGoals : activeGoals.map(g => g.title);
      const notes = savedNotes.map((n: any) => n.content);
      
      if (goalsToUse.length === 0 && notes.length === 0) {
        toast.error("No active objectives or intel found");
        return;
      }

      const result = await getDailyMission(goalsToUse, notes, commandInput);
      setBriefing(result);
      saveToHistory('briefing', result);
      setCommandInput("");
      toast.success(selectedGoals.length > 0 ? "Targeted briefing received" : "Collective strategic briefing received");
    } catch (error) {
      toast.error("AI Core unstable. Briefing offline.");
    } finally {
      setIsLoading(false);
    }
  };

  const buildRoadmap = async () => {
    setIsBuildingRoadmap(true);
    try {
      const selectedGoals = activeGoals.filter(g => selectedGoalIds.includes(g.id)).map(g => g.title);
      const goalsToUse = selectedGoals.length > 0 ? selectedGoals : activeGoals.map(g => g.title);
      
      if (goalsToUse.length === 0) {
        toast.error("Select objectives to plan");
        return;
      }
      
      const goalsList = goalsToUse.join(", ");
      const result = await generateContent(`Create a high-fidelity tactical roadmap that integrates the following objectives: "${goalsList}". 
      ${commandInput ? `Special Instructions: "${commandInput}".` : ""}
      Provide a unified 6-step plan that addresses these goals. 
      Format as a clean, markdown-style numbered list with short titles for each step.`, "groq");
      
      if (result) {
        setRoadmap(result);
        saveToHistory('roadmap', result);
        setCommandInput("");
        toast.success(selectedGoals.length > 0 ? "Targeted roadmap generated" : "Tactical roadmap generated");
      }
    } catch (error) {
      toast.error("Tactical analysis offline");
    } finally {
      setIsBuildingRoadmap(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="soft-card p-6 space-y-6 flex flex-col min-h-[500px]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pastel-yellow/30 transition-transform hover:scale-110">
            <Brain className="w-5 h-5 text-pastel-yellow-foreground" />
          </div>
          <h2 className="text-xl font-black text-foreground">Mission Control AI</h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pastel-green/20">
          <div className="w-1.5 h-1.5 rounded-full bg-pastel-green animate-pulse" />
          <span className="text-[10px] font-black text-pastel-green-foreground uppercase tracking-widest">Active</span>
        </div>
      </div>

      {/* Focus Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Mission Focus</span>
          {selectedGoalIds.length > 0 && (
            <button 
              onClick={() => setSelectedGoalIds([])}
              className="text-[10px] font-black text-primary hover:underline uppercase tracking-tight"
            >
              Reset focus
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {activeGoals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => {
                if (selectedGoalIds.includes(goal.id)) {
                  setSelectedGoalIds(selectedGoalIds.filter(id => id !== goal.id));
                } else {
                  setSelectedGoalIds([...selectedGoalIds, goal.id]);
                }
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border-2 ${selectedGoalIds.includes(goal.id) ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border-transparent text-[9px]"}`}
            >
              {goal.title}
            </button>
          ))}
          {activeGoals.length === 0 && (
            <span className="text-[10px] font-bold text-muted-foreground/30 italic py-2">No active objectives...</span>
          )}
        </div>
      </div>

      {/* Command Center */}
      <div className="space-y-4">
        <div className="relative group">
          <input 
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBriefing()}
            placeholder="Tactical Command (e.g. 'Focus on speed', 'Be technical')..."
            className="w-full bg-muted/20 border-2 border-transparent focus:border-primary/20 rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all placeholder:text-muted-foreground/30"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-xl transition-all ${showHistory ? "bg-primary text-white" : "hover:bg-primary/10 text-muted-foreground"}`}
              title="Intelligence History"
            >
              <StickyNote className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-2 -mr-2 relative">
        <AnimatePresence mode="popLayout">
          {showHistory ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-1">Mission Log</h3>
              {history.map((entry) => (
                <div key={entry.id} className="p-4 rounded-2xl bg-muted/10 border border-border/50 space-y-3 group/entry">
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${entry.type === 'briefing' ? 'bg-pastel-blue text-pastel-blue-foreground' : 'bg-pastel-orange text-pastel-orange-foreground'}`}>
                      {entry.type}
                    </span>
                    <span className="text-[8px] font-bold text-muted-foreground/40">{new Date(entry.date).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-foreground/60 line-clamp-2 italic">"{entry.content.substring(0, 100)}..."</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full h-8 text-[10px] font-black uppercase opacity-0 group-hover/entry:opacity-100 transition-all border border-border/50"
                    onClick={() => {
                      if (entry.type === 'briefing') setBriefing(entry.content);
                      else setRoadmap(entry.content);
                      setShowHistory(false);
                    }}
                  >
                    Restore
                  </Button>
                </div>
              ))}
              {history.length === 0 && (
                <div className="py-20 text-center opacity-20 italic text-sm">No historical data available.</div>
              )}
            </motion.div>
          ) : (
            <div className="space-y-6">
          {briefing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 rounded-[1.5rem] bg-pastel-blue/10 border border-pastel-blue/20 relative group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-pastel-blue-foreground uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Strategic Briefing
                </h3>
                {briefing?.match(/Mission Morale: (\d+)%/i) && (
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/50 border border-pastel-blue/20">
                    <Activity className="w-3 h-3 text-pastel-blue" />
                    <span className="text-[10px] font-black text-pastel-blue-foreground">{briefing.match(/Mission Morale: (\d+)%/i)?.[0]}</span>
                  </div>
                )}
              </div>
              <div className="text-sm text-foreground/80 leading-relaxed space-y-3 font-medium">
                {briefing.split('\n').filter(p => p.trim()).map((para, i) => (
                  <p key={i}>
                    {para}
                  </p>
                ))}
              </div>
              <button onClick={() => setBriefing(null)} className="absolute top-6 right-6 text-muted-foreground/30 hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {roadmap && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 rounded-[1.5rem] bg-pastel-orange/10 border border-pastel-orange/20 relative group"
            >
              <h3 className="text-[10px] font-black text-pastel-orange-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Route className="w-3 h-3" />
                Tactical Roadmap
              </h3>
              <div className="space-y-4">
                {roadmap.split('\n').filter(l => /^\d+\./.test(l.trim())).map((step, i) => (
                  <div key={i} className="flex items-center justify-between group/step p-3 rounded-xl hover:bg-white/50 transition-all border border-transparent hover:border-pastel-orange/20">
                    <span className="text-sm font-medium text-foreground/80">{step}</span>
                    <Button 
                      onClick={() => {
                        const savedGoals = JSON.parse(localStorage.getItem("horizon-goals") || "[]");
                        const newGoal = {
                          id: Date.now().toString(),
                          title: step.replace(/^\d+\.\s*/, ''),
                          progress: 0,
                          completed: false,
                          milestones: [],
                          priority: "Medium",
                          category: "designing",
                          time: "TBD",
                          context: "From AI Roadmap"
                        };
                        localStorage.setItem("horizon-goals", JSON.stringify([newGoal, ...savedGoals]));
                        window.dispatchEvent(new Event("storage"));
                        toast.success("Step deployed to objectives");
                      }}
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg text-pastel-orange hover:bg-pastel-orange hover:text-white transition-all opacity-0 group-hover/step:opacity-100"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {!roadmap.includes('1.') && (
                  <div className="text-sm text-foreground/80 leading-relaxed font-semibold whitespace-pre-line pl-6 ml-1 border-l-4 border-pastel-orange">
                    {roadmap}
                  </div>
                )}
              </div>
              <button onClick={() => setRoadmap(null)} className="absolute top-6 right-6 text-muted-foreground/30 hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {!briefing && !roadmap && (
            <motion.div 
              className="h-full flex flex-col justify-center items-center text-center py-20 space-y-6"
            >
              <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center animate-pulse">
                 <Brain className="w-10 h-10 text-muted-foreground/20" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-black text-foreground">Intelligence Grid Offline</p>
                <p className="text-xs text-muted-foreground/40 max-w-[200px] leading-relaxed font-bold uppercase tracking-wider">Initialize strategic analysis to generate deep tactical insights.</p>
              </div>
            </motion.div>
          )}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/50">
        <Button 
          onClick={fetchBriefing} 
          disabled={isLoading}
          className="h-14 bg-black text-white rounded-2xl shadow-xl shadow-black/10 hover:bg-black/80 transition-all"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-widest">Analyze</span>
            </div>
          )}
        </Button>
        <Button 
          onClick={buildRoadmap} 
          disabled={isBuildingRoadmap}
          variant="outline" 
          className="h-14 border-2 border-border/50 bg-white rounded-2xl hover:bg-muted/30 transition-all"
        >
          {isBuildingRoadmap ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-widest">Plan</span>
            </div>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

function XCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}
