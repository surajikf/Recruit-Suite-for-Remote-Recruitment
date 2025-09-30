import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { getSupabase } from '../lib/supabase';
import type { AppUser } from '../types';

type AuthContextValue = {
  loading: boolean;
  user: any | null;
  appUser: AppUser | null;
  isApproved: boolean;
  isAdmin: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabase();
  const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true';
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isApproved = !!appUser?.is_approved;
  const isAdmin = appUser?.role === 'admin';

  async function fetchAppUser(currentUser: any | null): Promise<AppUser | null> {
    if (!supabase || !currentUser?.email) {
      setAppUser(null);
      return null;
    }
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('email', currentUser.email)
      .single();
    if (error) {
      setAppUser(null);
      return null;
    }
    const app = data as unknown as AppUser;
    setAppUser(app);
    return app;
  }

  // Initialize session
  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      try {
        if (BYPASS_AUTH) {
          const dummyUser = { id: 'dev-user', email: 'dev@example.com', app_metadata: { provider: 'email' }, user_metadata: { name: 'Dev User' } } as any;
          setUser(dummyUser);
          setAppUser({
            id: 'dev-user',
            email: 'dev@example.com',
            name: 'Dev User',
            signup_method: 'email',
            role: 'admin',
            is_approved: true,
            created_at: new Date().toISOString() as any,
            updated_at: new Date().toISOString() as any,
          } as any);
          return;
        }
        if (!supabase) return;
        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user ?? null;
        if (!isMounted) return;
        setUser(currentUser);
        if (currentUser) {
          // Ensure app_users row for Google sign-in if missing
          const provider = (currentUser.app_metadata as any)?.provider as string | undefined;
          const { data: existing } = await supabase
            .from('app_users')
            .select('id')
            .eq('email', currentUser.email as string)
            .maybeSingle();
          if (!existing) {
            await supabase.from('app_users').insert({
              id: currentUser.id,
              email: currentUser.email,
              name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || null,
              signup_method: provider === 'google' ? 'google' : 'email',
              role: 'user',
              is_approved: provider === 'email' ? false : false,
            });
          }
          await fetchAppUser(currentUser);
        } else {
          setAppUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();
    if (BYPASS_AUTH) {
      setLoading(false);
      return () => {};
    }
    const { data: sub } = supabase?.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await fetchAppUser(u);
      } else {
        setAppUser(null);
      }
    }) || { data: { subscription: { unsubscribe() {} } } } as any;
    return () => {
      isMounted = false;
      (sub as any)?.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    setError(null);
    if (BYPASS_AUTH) return;
    if (!supabase) return;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Invalid credentials');
      throw error;
    }
    const currentUser = data.user;
    await fetchAppUser(currentUser);
  };

  const signUp = async (name: string, email: string, password: string) => {
    setError(null);
    if (BYPASS_AUTH) return;
    if (!supabase) return;
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) {
      setError(error.message || 'Signup failed');
      throw error;
    }
    const user = data.user;
    if (user) {
      await supabase.from('app_users').insert({
        id: user.id,
        email,
        name,
        signup_method: 'email',
        role: 'user',
        is_approved: false,
      });
      await supabase.auth.signOut();
    }
  };

  // Google sign-in removed

  const signOut = async () => {
    setError(null);
    if (BYPASS_AUTH) {
      setUser(null);
      setAppUser(null);
      return;
    }
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const value: AuthContextValue = useMemo(() => ({
    loading,
    user,
    appUser,
    isApproved,
    isAdmin,
    error,
    signIn,
    signUp,
    signOut,
  }), [loading, user, appUser, isApproved, isAdmin, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}



