import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapDbUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    fullName: (row.full_name as string) || '',
    avatarUrl: (row.avatar_url as string) || undefined,
    cashbackBalance: Number(row.cashback_balance || 0),
    totalEarned: Number(row.total_earned || 0),
    referralCode: (row.referral_code as string) || '',
    createdAt: (row.created_at as string) || new Date().toISOString(),
    role: (row.role as 'user' | 'admin') || 'user',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return mapDbUser(data);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setIsLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
      })();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };

    if (data.user) {
      const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        referral_code: referralCode,
        role: 'user',
      });
    }
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
