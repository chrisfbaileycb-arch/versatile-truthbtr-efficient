import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Plan } from '@/data/truthbuster';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'individual' | 'practice';
  plan: Plan;
  scans_used: number;
  scans_period_start: string;
  realized_savings: number;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  recordScan: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Adds (or subtracts, when negative) recovered spend on the profiles row. */
  addRealizedSavings: (delta: number) => Promise<void>;
}


const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const monthStart = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string, email?: string | null) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      // Roll the monthly scan counter over if we've crossed into a new month.
      if (data.scans_period_start !== monthStart()) {
        const { data: rolled } = await supabase
          .from('profiles')
          .update({ scans_used: 0, scans_period_start: monthStart() })
          .eq('id', userId)
          .select()
          .maybeSingle();
        setProfile((rolled as Profile) ?? (data as Profile));
        return;
      }
      setProfile(data as Profile);
      return;
    }

    // Fallback if the signup trigger has not landed yet.
    const { data: created } = await supabase
      .from('profiles')
      .insert({ id: userId, email: email ?? null })
      .select()
      .maybeSingle();
    setProfile((created as Profile) ?? null);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id, data.session.user.email).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        loadProfile(nextSession.user.id, nextSession.user.email);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signInWithMagicLink = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return error ? { error: error.message } : {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id, session.user.email);
  }, [session, loadProfile]);

  const recordScan = useCallback(async () => {
    if (!session?.user || !profile) return;
    const next = profile.scans_used + 1;
    setProfile({ ...profile, scans_used: next });
    await supabase
      .from('profiles')
      .update({ scans_used: next, scans_period_start: monthStart() })
      .eq('id', session.user.id);
  }, [session, profile]);

  const addRealizedSavings = useCallback(
    async (delta: number) => {
      if (!session?.user || !profile || !Number.isFinite(delta) || delta === 0) return;
      const next = Math.max(0, Number(profile.realized_savings ?? 0) + delta);
      setProfile({ ...profile, realized_savings: next });
      await supabase
        .from('profiles')
        .update({ realized_savings: next, updated_at: new Date().toISOString() })
        .eq('id', session.user.id);
    },
    [session, profile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signInWithMagicLink,
      signOut,
      recordScan,
      refreshProfile,
      addRealizedSavings,
    }),
    [
      session,
      profile,
      loading,
      signInWithMagicLink,
      signOut,
      recordScan,
      refreshProfile,
      addRealizedSavings,
    ],
  );


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
};
