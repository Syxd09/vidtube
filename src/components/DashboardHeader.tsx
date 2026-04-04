import { Orbit, LogOut, Bell, Search, Command, Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  onLogout: () => void;
}

export default function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 border-b border-border/40 bg-white/60 backdrop-blur-xl h-20"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-full">
        {/* Brand - Only visible on mobile in header */}
        <div className="flex items-center gap-3 lg:hidden">
          <div className="p-2 rounded-xl bg-primary/10 transition-transform hover:scale-110 duration-500">
            <Orbit className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-black tracking-tighter text-foreground">HORIZON</span>
        </div>

        {/* Global Search - Simplified */}
        <div className="hidden lg:flex items-center flex-1 max-w-sm ml-4">
          <div className={`relative w-full group transition-all duration-300`}>
            <div className="relative flex items-center h-11 bg-muted/40 rounded-2xl border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden px-4">
              <Search className={`w-4 h-4 transition-colors ${searchFocused ? "text-primary" : "text-muted-foreground/40"}`} />
              <input
                type="text"
                placeholder="Search resources..."
                className="flex-1 h-full bg-transparent border-none pl-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:ring-0 focus:outline-none font-medium"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/5">
                <Command className="w-3 h-3 text-muted-foreground/30" />
                <span className="text-[10px] text-muted-foreground/30 font-black">K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 mr-2">
             <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.1em]">Neural Engine</span>
               <div className="flex items-center gap-1.5 mt-0.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                 <span className="text-[11px] font-bold text-foreground/80">Active</span>
               </div>
             </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-11 w-11 relative text-muted-foreground/40 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white" />
          </Button>

          <div className="flex items-center gap-3 pl-4 border-l border-border/50">
            {(() => {
              const [user, setUser] = useState({ name: "Commander", email: "hq@horizon.ai" });
              
              useEffect(() => {
                const update = () => {
                  const saved = localStorage.getItem("horizon-user");
                  if (saved) setUser(JSON.parse(saved));
                };
                update();
                window.addEventListener("storage", update);
                return () => window.removeEventListener("storage", update);
              }, []);

              const initials = user.name.substring(0, 1).toUpperCase();
              
              return (
                <motion.div 
                   whileHover={{ scale: 1.05 }}
                   className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
                    <span className="text-sm font-black text-white">{initials}</span>
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-black text-foreground/80 leading-none truncate max-w-[100px]">{user.name}</span>
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter mt-1">
                      Horizon Level 01
                    </span>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
