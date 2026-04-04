import React from 'react';
import { motion } from 'framer-motion';

interface ActivityChartProps {
  days?: number;
}

export default function ActivityChart({ days = 35 }: ActivityChartProps) {
  // Simulate data fetching from horizon-history
  const rawHistory = localStorage.getItem("horizon-history");
  const history = Array.isArray(JSON.parse(rawHistory || "[]")) ? JSON.parse(rawHistory || "[]") : [];
  
  // Create a map of date -> completion count
  const activityMap: Record<string, number> = {};
  history.forEach((entry: any) => {
    const dateKey = new Date(entry.timestamp).toISOString().split('T')[0];
    activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
  });

  // Generate last N days
  const data = Array.from({ length: days }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dateKey = date.toISOString().split('T')[0];
    const count = activityMap[dateKey] || 0;
    
    return {
      date: dateKey,
      count,
      level: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : 3
    };
  });

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-primary/30';
      case 2: return 'bg-primary/60';
      case 3: return 'bg-primary';
      default: return 'bg-muted/30';
    }
  };

  return (
    <div className="soft-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Productivity Pulse</h3>
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-bold text-muted-foreground/30 uppercase">Less</span>
           {[0, 1, 2, 3].map(l => (
             <div key={l} className={`w-2 h-2 rounded-sm ${getLevelColor(l)}`} />
           ))}
           <span className="text-[8px] font-bold text-muted-foreground/30 uppercase">More</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1.5 justify-center">
        {data.map((day, i) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.01 }}
            className={`w-4 h-4 rounded-sm ${getLevelColor(day.level)} cursor-help transition-transform hover:scale-125`}
            title={`${day.date}: ${day.count} deployments`}
          />
        ))}
      </div>
      
      <div className="pt-4 flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-2xl font-black text-primary">{history.length}</p>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">Total Strategic Wins</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm font-black text-foreground">{(history.length / (days/7)).toFixed(1)} <span className="text-[10px] text-muted-foreground/40 font-bold">/ WK</span></p>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">Deployment Velocity</p>
        </div>
      </div>
    </div>
  );
}
