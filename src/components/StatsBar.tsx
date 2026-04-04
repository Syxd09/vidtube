import { Trophy, Activity, Flame, Target, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function StatsBar() {
  const [stats, setStats] = useState({
    goals: [],
    completion: 0,
    doneCount: 0,
    streak: 1,
    habits: 4,
    wins: 0
  });

  useEffect(() => {
    const updateStats = () => {
      const goals = JSON.parse(localStorage.getItem("horizon-goals") || "[]");
      const history = JSON.parse(localStorage.getItem("horizon-history") || "{}");
      const habits = JSON.parse(localStorage.getItem("horizon-habits") || "[]");
      
      const doneCount = goals.filter((g: any) => g.completed).length;
      const totalCount = goals.length;
      const todayCompletion = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
      
      // Update today's history
      const today = new Date().toISOString().split('T')[0];
      if (totalCount > 0) {
        history[today] = todayCompletion;
        localStorage.setItem("horizon-history", JSON.stringify(history));
      }

      // Calculate Weekly Avg
      let totalWeeklyProgress = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        totalWeeklyProgress += history[dStr] || 0;
      }
      const weeklyAvg = Math.round(totalWeeklyProgress / 7);

      // Calculate Streak
      let streakCount = 0;
      let checkDate = new Date();
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        // Streak continues if completion > 0 (or some threshold)
        if (history[dateStr] && history[dateStr] > 0) {
          streakCount++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      setStats({
        goals,
        completion: todayCompletion,
        doneCount,
        streak: streakCount || 1,
        habits: habits.length || 0,
        wins: Object.values(history).filter((v: any) => v >= 100).length // Fully completed days
      });
    };

    updateStats();
    window.addEventListener("storage", updateStats);
    const interval = setInterval(updateStats, 2000);
    return () => {
      window.removeEventListener("storage", updateStats);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Main Progress Card - Circular */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 soft-card bg-pastel-pink/30 p-8 flex items-center justify-between group overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-pink rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
        
        <div className="space-y-4 relative">
          <div>
            <h3 className="text-2xl font-black text-foreground">My Plan</h3>
            <p className="text-muted-foreground/60 text-sm font-bold mt-1">For Today</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-foreground">{stats.doneCount}</span>
            <span className="text-muted-foreground/30 text-lg font-bold">/</span>
            <span className="text-muted-foreground/40 text-lg font-bold">{stats.goals.length} completed</span>
          </div>
        </div>

        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-white/40"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray="364.4"
              initial={{ strokeDashoffset: 364.4 }}
              animate={{ strokeDashoffset: 364.4 - (364.4 * stats.completion) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-pastel-pink-foreground"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-foreground">{stats.completion}%</span>
          </div>
        </div>
      </motion.div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-2 gap-4 xl:w-[480px]">
        {[
          { label: "Wins", value: `${stats.wins}`, icon: Trophy, color: "bg-pastel-pink", iconColor: "text-pastel-pink-foreground" },
          { label: "Weekly Avg", value: `${Math.round((Object.values(JSON.parse(localStorage.getItem("horizon-history") || "{}")) as number[]).reduce((a: number, b: number) => a + b, 0) / 7)}%`, icon: Activity, color: "bg-pastel-green", iconColor: "text-pastel-green-foreground" },
          { label: "Total Habits", value: stats.habits.toString(), icon: Target, color: "bg-pastel-blue", iconColor: "text-pastel-blue-foreground" },
          { label: "Best Streak", value: `${stats.streak} Days`, icon: Flame, color: "bg-pastel-yellow", iconColor: "text-pastel-yellow-foreground" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="soft-card p-4 flex flex-col items-center justify-center text-center space-y-3 hover:bg-muted/30 transition-colors"
          >
            <div className={`p-2.5 rounded-xl ${item.color}`}>
              <item.icon className={`w-5 h-5 ${item.iconColor}`} />
            </div>
            <div>
              <p className="text-lg font-black text-foreground leading-none">{item.value}</p>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mt-2">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
