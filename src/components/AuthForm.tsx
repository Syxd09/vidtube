import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, getRedirectResult } from 'firebase/auth';
import { useEffect } from 'react';
import { CortexLogo } from './CortexLogo';

const API_BASE_URL = '/api';

export const AuthForm = () => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Handle redirect result when user comes back
  useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result) {
        const idToken = await result.user.getIdToken();
        const res = await fetch(`${API_BASE_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: idToken }),
        });
        const data = await res.json();
        if (res.ok) {
          signIn(data.user, data.token);
          toast.success('Signed in with Google!');
        }
      }
    }).catch(() => {});
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: idToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');

      signIn(data.user, data.token);
      toast.success('Signed in with Google!');
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        try {
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch {
          toast.error('Sign-in failed. Please try again.');
        }
      } else {
        toast.error(err.message || 'Google login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-up">
      <div className="glass-premium p-8 rounded-[2rem] border-white/10 glow-primary relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/20 blur-[80px] rounded-full" />

        <div className="relative z-10 py-4">
          <div className="text-center mb-12 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl">
               <CortexLogo size={32} className="text-primary" />
            </div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter glitch-text-hover mb-4">
              CortexOS
            </h1>
            <p className="text-muted-foreground text-xs uppercase tracking-widest leading-relaxed">
              Neural Research Command Access Node.<br/>
              Sign in with your Google account to continue.
            </p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full h-16 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-4 transition-all group shadow-xl hover:shadow-primary/20"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-lg">
              {isLoading ? 'Connecting...' : 'Sign in with Google'}
            </span>
          </Button>

          <p className="mt-12 text-center text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">
            Secure Identity Protocol Active
          </p>
        </div>
      </div>
    </div>
  );
};
