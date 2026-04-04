import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Desktop from "./pages/Desktop.tsx";
import { AdminDashboard } from "./components/AdminDashboard";
import NotFound from "./pages/NotFound.tsx";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { AuthForm } from "./components/AuthForm";
import { HeroScene } from "./components/HeroScene";
import { CortexLogo } from "./components/CortexLogo";
import { WindowProvider } from "./context/WindowContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isLoading } = useAuth();
  
  // Ensure dark mode is always active
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#04060c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 bg-[#030303]">
        <HeroScene />
        <div className="relative z-20 mb-12 text-center max-w-xl mx-auto space-y-4 animate-fade-up">
          <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl glow-primary/20">
            <CortexLogo size={40} className="text-primary" />
          </div>
          <h2 className="text-7xl font-black tracking-tighter text-white leading-[0.8] mb-4">
            <span className="glitch-text-hover inline-block">CorteX</span> <br/>
            <span className="text-primary italic tracking-tight opacity-90">Intelligence OS</span>
          </h2>
          <p className="text-white/40 text-xl font-medium pt-4">
            The high-density personal OS terminal. <br/> Analyze, research, and command your digital life.
          </p>
        </div>
        <div className="relative z-20 w-full max-w-md animate-fade-up delay-150">
          <AuthForm />
        </div>
      </main>
    );
  }

  return (
    <WindowProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Desktop />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WindowProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
