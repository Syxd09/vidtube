import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';

const API_BASE_URL = '/api';

export const AuthForm = () => {
  const { signIn, initializeGuest } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSuccess = async (response: any) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');

      signIn(data.user, data.token);
      toast.success('Signed in with Google!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const body = isLogin ? { email, password } : { name, email, password };
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      signIn(data.user, data.token);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-up">
      <div className="glass-premium p-8 rounded-[2rem] border-white/10 glow-primary relative overflow-hidden">
        {/* Animated background highlights */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/20 blur-[80px] rounded-full" />

        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black gradient-text-vibrant mb-3 text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground text-sm text-center">
              {isLogin ? 'Access your AI video assistant' : 'Sign up with your details to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    className="bg-white/5 border-white/10 pl-10 h-11 rounded-xl focus:ring-primary/50 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="bg-white/5 border-white/10 pl-10 h-11 rounded-xl focus:ring-primary/50 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 pl-10 h-11 rounded-xl focus:ring-primary/50 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/25 group transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
              <span className="bg-[#030303] px-4 text-white/20">Advanced Authentication</span>
            </div>
          </div>

          <div className="flex justify-center transform scale-110">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign-In failed')}
              useOneTap
              theme="filled_black"
              shape="pill"
            />
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                initializeGuest();
                toast.success('Entering as Guest Explorer');
              }}
              className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-primary transition-colors"
            >
              Explore as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
