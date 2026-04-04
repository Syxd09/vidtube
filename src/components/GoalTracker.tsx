import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Target, Plus, CheckCircle2, Circle, Trash2, 
  ChevronRight, Sparkles, Loader2, Leaf, Bike, 
  Utensils, Palette, Music, PenTool, Bed, Wrench, X, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { refineGoal } from "@/lib/ai-service";
import { toast } from "sonner";

interface Goal {
  id: string;
  title: string;
  progress: number;
  completed: boolean;
  milestones: { id: string; text: string; done: boolean }[];
  priority: "High" | "Medium" | "Low";
  category?: string;
  time?: string;
  context?: string;
  estimatedHours?: number;
  actualHours?: number;
}

const CATEGORIES = [
  { id: "gardening", name: "Gardening", icon: Leaf, color: "bg-pastel-green", iconColor: "text-pastel-green-foreground" },
  { id: "cycling", name: "Cycling", icon: Bike, color: "bg-pastel-yellow", iconColor: "text-pastel-yellow-foreground" },
  { id: "cooking", name: "Cooking", icon: Utensils, color: "bg-pastel-orange", iconColor: "text-pastel-orange-foreground" },
  { id: "painting", name: "Painting", icon: Palette, color: "bg-pastel-blue", iconColor: "text-pastel-blue-foreground" },
  { id: "music", name: "Music", icon: Music, color: "bg-pastel-pink", iconColor: "text-pastel-pink-foreground" },
  { id: "designing", name: "Designing", icon: PenTool, color: "bg-pastel-orange", iconColor: "text-pastel-orange-foreground" },
  { id: "sleeping", name: "Sleeping", icon: Bed, color: "bg-pastel-blue", iconColor: "text-pastel-blue-foreground" },
  { id: "mechanic", name: "Mechanic", icon: Wrench, color: "bg-pastel-yellow", iconColor: "text-pastel-yellow-foreground" },
];

export default function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("horizon-goals");
    return saved ? JSON.parse(saved) : [];
  });
  const [newGoal, setNewGoal] = useState("");
  const [showCategoryGrid, setShowCategoryGrid] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [isGeneratingMilestones, setIsGeneratingMilestones] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("horizon-goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem("horizon-goals");
      if (saved) setGoals(JSON.parse(saved));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addGoal = (title?: string) => {
    const goalTitle = title || newGoal;
    if (!goalTitle.trim()) return;
    
    const cat = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

    const goal: Goal = {
       id: Date.now().toString(),
       title: goalTitle,
       progress: 0,
       completed: false,
       milestones: [],
       priority: "Medium",
       category: cat.id,
       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
       estimatedHours: 4, // Default estimate
       actualHours: 0
    };

    setGoals([...goals, goal]);
    setNewGoal("");
    setShowCategoryGrid(false);
    setSelectedCategory(null);
    toast.success("Objective initialized");
  };

  const addMilestoneManually = (goalId: string, text: string) => {
    if (!text.trim()) return;
    setGoals(goals.map(g => {
      if (g.id !== goalId) return g;
      const newMilestone = { id: Date.now().toString(), text, done: false };
      const updated = [...g.milestones, newMilestone];
      return { 
        ...g, 
        milestones: updated, 
        progress: Math.round((updated.filter(m => m.done).length / updated.length) * 100) 
      };
    }));
    toast.success("Tactical step added");
  };

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed, progress: g.completed ? 0 : 100 } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(g => {
      if (g.id !== goalId) return g;
      const updated = g.milestones.map(m => m.id === milestoneId ? { ...m, done: !m.done } : m);
      const doneCount = updated.filter(m => m.done).length;
      return { ...g, milestones: updated, progress: updated.length ? Math.round((doneCount / updated.length) * 100) : 0 };
    }));
  };

  const generateAIMilestones = async (goal: Goal) => {
    setIsGeneratingMilestones(goal.id);
    try {
      const refined = await refineGoal(goal.title);
      if (refined && refined.milestones) {
        setGoals(goals.map(g => {
          if (g.id !== goal.id) return g;
          const newMilestones = refined.milestones.map((m: string) => ({
            id: Math.random().toString(36).substr(2, 9),
            text: m,
            done: false
          }));
          return { ...g, milestones: [...g.milestones, ...newMilestones], context: refined.context };
        }));
        toast.success("Tactical roadmap deployed");
      }
    } catch (e) {
      toast.error("AI refinement failed");
    } finally {
      setIsGeneratingMilestones(null);
    }
  };

  const incrementTime = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, actualHours: (g.actualHours || 0) + 1 } : g));
    toast.success("Focus hour logged");
  };

  const archiveGoal = (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      const archived = JSON.parse(localStorage.getItem("horizon-archived") || "[]");
      localStorage.setItem("horizon-archived", JSON.stringify([goal, ...archived]));
      setGoals(goals.filter(g => g.id !== id));
      toast.success("Objective moved to archives");
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-foreground">Today's Task</h2>
        <button className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest hover:text-primary">See all</button>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {!showCategoryGrid ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex gap-3"
            >
              <Input
                placeholder="What's your focus?"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onFocus={() => setShowCategoryGrid(true)}
                className="h-14 rounded-2xl bg-white border-none shadow-sm font-medium px-6 text-sm"
              />
              <Button onClick={() => setShowCategoryGrid(true)} size="icon" className="h-14 w-14 rounded-2xl bg-black text-white">
                <Plus className="w-6 h-6" />
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="soft-card bg-white p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black tracking-tight">Add your goals</h3>
                <button onClick={() => setShowCategoryGrid(false)} className="p-2 hover:bg-muted rounded-full transition-all">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-6 rounded-[1.5rem] border-2 transition-all ${selectedCategory === cat.id ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-transparent bg-muted/30"}`}
                  >
                    <div className={`p-3 rounded-2xl ${cat.color} mb-3 transition-transform ${selectedCategory === cat.id ? "scale-110" : ""}`}>
                      <cat.icon className={`w-6 h-6 ${cat.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider">{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Objective title..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="h-14 rounded-2xl bg-muted/50 border-none font-medium px-6"
                />
                <Button 
                  onClick={() => addGoal()} 
                  disabled={!newGoal.trim() || !selectedCategory}
                  className="w-full h-14 rounded-2xl bg-black text-white font-black text-sm disabled:opacity-20"
                >
                  Let's Go
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {goals.map((goal) => {
            const cat = CATEGORIES.find(c => c.id === goal.category) || CATEGORIES[0];
            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`soft-card p-6 flex flex-col justify-between cursor-pointer group transition-all ${goal.completed ? "opacity-30 grayscale" : "hover:shadow-xl hover:shadow-primary/5"} ${expandedGoal === goal.id ? "min-h-[400px]" : "h-[200px]"}`}
                onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-4 rounded-2xl ${cat.color} transition-transform group-hover:scale-110`}>
                    <cat.icon className={`w-7 h-7 ${cat.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    {goal.completed && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); archiveGoal(goal.id); }}
                        className="h-8 px-3 text-[10px] font-black text-muted-foreground/40 hover:text-foreground uppercase tracking-widest"
                      >
                        Archive
                      </Button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleGoal(goal.id); }}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${goal.completed ? "bg-secondary border-secondary text-white" : "border-muted-foreground/20 hover:border-primary"}`}
                    >
                      {goal.completed && <CheckCircle2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className={`text-xl font-black tracking-tight ${goal.completed ? "line-through" : ""}`}>{goal.title}</h4>
                  <div className="flex items-center gap-2 mt-2 opacity-40">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{goal.time}</span>
                  </div>
                </div>

                <AnimatePresence>
                   {expandedGoal === goal.id && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: "auto" }}
                       exit={{ opacity: 0, height: 0 }}
                       className="pt-6 mt-6 border-t border-border/50 space-y-4"
                       onClick={(e) => e.stopPropagation()}
                     >
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Tactical Roadmap ({goal.progress}%)</span>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => generateAIMilestones(goal)}
                           disabled={isGeneratingMilestones === goal.id}
                           className="h-8 px-4 text-[10px] font-black bg-primary/5 text-primary hover:bg-primary/10 rounded-full"
                         >
                           {isGeneratingMilestones === goal.id ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                           AI_GENERATE
                         </Button>
                       </div>

                        <div className="space-y-3">
                          {goal.milestones.map(m => (
                            <div key={m.id} className="flex items-center gap-3 group/m">
                              <button onClick={() => toggleMilestone(goal.id, m.id)} className="shrink-0 transition-transform active:scale-90">
                                {m.done ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4 text-muted-foreground/20" />}
                              </button>
                              <span className={`text-sm font-medium transition-all ${m.done ? "line-through opacity-30" : "text-foreground/80"}`}>{m.text}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Input 
                             placeholder="New tactical step..."
                             id={`milestone-${goal.id}`}
                             className="h-10 rounded-xl bg-muted/30 border-none text-xs px-4 focus:ring-1 ring-primary/20"
                             onKeyDown={(e) => {
                               if (e.key === "Enter") {
                                 const val = (e.target as HTMLInputElement).value;
                                 if (val.trim()) {
                                   addMilestoneManually(goal.id, val);
                                   (e.target as HTMLInputElement).value = "";
                                 }
                               }
                             }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 mt-2">
                           <div className="soft-card p-3 bg-muted/10 border-none">
                              <div className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1 text-center">Estimation</div>
                              <div className="text-sm font-black text-center">{goal.estimatedHours || 0}H</div>
                           </div>
                           <button 
                              onClick={(e) => { e.stopPropagation(); incrementTime(goal.id); }}
                              className="soft-card p-3 bg-primary/5 border-none hover:bg-primary/10 transition-colors group/time"
                           >
                              <div className="text-[8px] font-black text-primary/40 uppercase tracking-widest mb-1 text-center">Actual Spent</div>
                              <div className="text-sm font-black text-center text-primary flex items-center justify-center gap-1">
                                {goal.actualHours || 0}H
                                <Plus className="w-2 h-2 opacity-0 group-hover/time:opacity-100 transition-opacity" />
                              </div>
                           </button>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <button onClick={() => deleteGoal(goal.id)} className="text-[10px] font-black text-destructive/40 hover:text-destructive uppercase tracking-widest transition-colors flex items-center gap-2">
                            <Trash2 className="w-3 h-3" /> Terminate
                          </button>
                        </div>
                     </motion.div>
                   )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
