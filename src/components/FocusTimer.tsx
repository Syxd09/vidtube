import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, Timer as TimerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    const nextMode = mode === 'work' ? 'break' : 'work';
    const nextTime = nextMode === 'work' ? 25 * 60 : 5 * 60;
    
    setMode(nextMode);
    setTimeLeft(nextTime);
    setIsActive(false);
    
    // Play sound or notification if possible
    toast.success(nextMode === 'work' ? "Break over. Back to mission focus!" : "Focus session complete. Tactical rest initiated.");
    
    if (mode === 'work') {
      // Record a session in history if desired
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative group overflow-hidden rounded-[2.5rem] p-8 aspect-square flex flex-col items-center justify-center bg-[#09090b] border border-white/5 shadow-2xl">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <div className="relative z-10 space-y-8 w-full flex flex-col items-center">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${mode === 'work' ? 'bg-primary' : 'bg-secondary'}`} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
            {mode === 'work' ? 'Tactical mission' : 'Rest period'}
          </span>
        </div>

        <div className="relative">
          <motion.div 
            key={timeLeft}
            initial={{ opacity: 0.8, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-7xl font-black tracking-tighter tabular-nums text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          >
            {formatTime(timeLeft)}
          </motion.div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={resetTimer}
            className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleTimer}
            className="h-20 w-20 rounded-[2rem] bg-primary text-white shadow-[0_0_40px_rgba(59,130,246,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>

          <div className="w-11" /> {/* Layout balancer */}
        </div>

        <div className="w-full space-y-3 pt-4">
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
            <span>Progress</span>
            <span>{Math.round((1 - timeLeft / (mode === 'work' ? 25 * 60 : 5 * 60)) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              style={{ width: `${(1 - timeLeft / (mode === 'work' ? 25 * 60 : 5 * 60)) * 100}%` }}
              className="h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Zap className="w-3 h-3 text-primary fill-primary animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80">Neural Link Active</span>
        </div>
      </div>
    </div>
  );
}
