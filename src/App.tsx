import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { AuthForm } from "./components/AuthForm";
import { HeroScene } from "./components/HeroScene";
import { Zap } from "lucide-react";

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

  return (
    <div className="relative min-h-screen bg-[#030303] selection:bg-primary/30">
      {!user ? (
        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          <HeroScene />
          <div className="relative z-20 mb-12 text-center max-w-xl mx-auto space-y-4 animate-fade-up">
            <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-6xl font-black tracking-tight text-white leading-[0.9]">
              Intelligence <br/>
              <span className="gradient-text-vibrant">Simplified.</span>
            </h2>
            <p className="text-white/40 text-xl font-medium pt-4">
              The professional video intelligence terminal. <br/> Analyze, extract, and master content in seconds.
            </p>
          </div>
          <div className="relative z-20 w-full max-w-md animate-fade-up delay-150">
            <AuthForm />
          </div>
        </main>
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<Route path="*" element={<NotFound />} />} />
          </Routes>
        </BrowserRouter>
      )}
    </div>
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
