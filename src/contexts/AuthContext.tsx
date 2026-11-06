import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { hasOwnerRole, isSupabaseConfigured, supabase } from "@/lib/auth";
import { AuthContext, type AuthContextValue } from "@/contexts/authState";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setLoading(false);
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error("Unable to restore the Supabase session.", error);
      setSession(data.session);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    configured: isSupabaseConfigured,
    loading,
    session,
    isOwner: hasOwnerRole(session?.user.app_metadata),
    signIn: async (email, password) => {
      if (!supabase) return new Error("Owner sign-in is not configured.");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) setSession(data.session);
      return error;
    },
    signOut: async () => {
      if (!supabase) return null;
      const { error } = await supabase.auth.signOut();
      if (!error) setSession(null);
      return error;
    },
  }), [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
