import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  picture?: string;
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (userData: User, token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = '/api';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('vidtube_user');
    const savedToken = localStorage.getItem('vidtube_token');
    
    if (savedUser && savedToken) {
      try {
        if (savedToken === 'undefined' || savedToken === 'null' || savedToken.length < 10) {
          throw new Error('Invalid token');
        }
        
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('vidtube_user');
        localStorage.removeItem('vidtube_token');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('vidtube_user', JSON.stringify(userData));
    localStorage.setItem('vidtube_token', authToken);
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vidtube_user');
    localStorage.removeItem('vidtube_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
