import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  consumeAuthRedirect,
  getAuthenticatedUser,
  getOrCreateWorkspace,
  readPersistedSession,
  refreshAuthSession,
  requestPasswordReset,
  signInWithPassword,
  signOutFromSupabase,
  signUpWithPassword,
  updateAccountPassword,
  type AuthSession,
  type AuthUser,
  type Workspace,
} from "@/lib/supabaseAuth";

type AuthContextValue = {
  session: AuthSession | null;
  user: AuthUser | null;
  workspace: Workspace | null;
  loading: boolean;
  recoveryFlow: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryFlow, setRecoveryFlow] = useState(false);
  const refreshInFlight = useRef(false);
  const authEpoch = useRef(0);

  const activateSession = useCallback(async (next: AuthSession) => {
    const epoch = ++authEpoch.current;
    setSession(next);
    const currentUser = await getAuthenticatedUser(next);
    if (epoch !== authEpoch.current) return;
    const verifiedSession = { ...next, user: currentUser };
    setSession(verifiedSession);
    const ownerWorkspace = await getOrCreateWorkspace(verifiedSession);
    if (epoch === authEpoch.current) setWorkspace(ownerWorkspace);
  }, []);

  useEffect(() => {
    let active = true;
    const bootstrapEpoch = authEpoch.current;
    const bootstrap = async () => {
      try {
        const redirect = await consumeAuthRedirect();
        if (redirect.type === "recovery") setRecoveryFlow(true);
        let current = redirect.session ?? readPersistedSession();
        if (current && current.expires_at <= Math.floor(Date.now() / 1000) + 60) {
          current = await refreshAuthSession(current);
        }
        if (current) {
          const user = await getAuthenticatedUser(current);
          current = { ...current, user };
          if (active && bootstrapEpoch === authEpoch.current) {
            setSession(current);
            const ownerWorkspace = await getOrCreateWorkspace(current);
            if (active && bootstrapEpoch === authEpoch.current) setWorkspace(ownerWorkspace);
          }
        }
      } catch {
        if (active && bootstrapEpoch === authEpoch.current) {
          setSession(null);
          setWorkspace(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void bootstrap();
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "hr-catalyst:supabase-auth-session") return;
      ++authEpoch.current;
      if (!event.newValue) {
        setSession(null);
        setWorkspace(null);
        return;
      }
      const next = readPersistedSession();
      if (!next) {
        setSession(null);
        setWorkspace(null);
        return;
      }
      void activateSession(next).catch(() => {
        if (active) {
          ++authEpoch.current;
          setSession(null);
          setWorkspace(null);
        }
      });
    };
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", onStorage);
    };
  }, [activateSession]);

  useEffect(() => {
    if (!session) return;
    const refreshIfNeeded = async () => {
      if (refreshInFlight.current || session.expires_at > Math.floor(Date.now() / 1000) + 120) return;
      const epoch = authEpoch.current;
      refreshInFlight.current = true;
      try {
        const refreshed = await refreshAuthSession(session);
        if (epoch !== authEpoch.current) return;
        setSession(refreshed);
        const currentUser = await getAuthenticatedUser(refreshed);
        if (epoch === authEpoch.current) setSession({ ...refreshed, user: currentUser });
      } catch {
        if (epoch === authEpoch.current) {
          ++authEpoch.current;
          setSession(null);
          setWorkspace(null);
        }
      } finally {
        refreshInFlight.current = false;
      }
    };
    const timer = window.setInterval(() => { void refreshIfNeeded(); }, 30_000);
    void refreshIfNeeded();
    return () => window.clearInterval(timer);
  }, [session]);

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await signInWithPassword(email, password);
    await activateSession(next);
  }, [activateSession]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const result = await signUpWithPassword(email, password, fullName);
    if (result.session) await activateSession(result.session);
    return Boolean(result.session);
  }, [activateSession]);

  const signOut = useCallback(async () => {
    ++authEpoch.current;
    try {
      await signOutFromSupabase(session);
    } finally {
      setSession(null);
      setWorkspace(null);
      setRecoveryFlow(false);
    }
  }, [session]);

  const reset = useCallback((email: string) => requestPasswordReset(email), []);
  const updatePassword = useCallback(async (password: string) => {
    if (!session) throw new Error("Open the password recovery link again to continue.");
    await updateAccountPassword(session, password);
    setRecoveryFlow(false);
  }, [session]);

  const value = useMemo(() => ({
    session, user: session?.user ?? null, workspace, loading, recoveryFlow,
    signIn, signUp, signOut, requestPasswordReset: reset, updatePassword,
  }), [session, workspace, loading, recoveryFlow, signIn, signUp, signOut, reset, updatePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
};
