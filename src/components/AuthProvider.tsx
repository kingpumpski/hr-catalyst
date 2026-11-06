import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  consumeAuthRedirect,
  getAuthenticatedUser,
  getOrCreateWorkspace,
  getSupabaseClient,
  readPersistedSession,
  requestPasswordReset,
  signInWithPassword,
  signOutFromSupabase,
  signUpWithPassword,
  toAuthSession,
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
    const { data: { subscription } } = getSupabaseClient().auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryFlow(true);
      if (event === "SIGNED_OUT") {
        ++authEpoch.current;
        setSession(null);
        setWorkspace(null);
        setRecoveryFlow(false);
        return;
      }
      if (!nextSession || event === "INITIAL_SESSION") return;
      const mapped = toAuthSession(nextSession);
      if (!mapped) return;
      if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setSession(mapped);
        return;
      }
      queueMicrotask(() => {
        if (!active) return;
        void activateSession(mapped).catch(() => {
          if (active) {
            ++authEpoch.current;
            setSession(null);
            setWorkspace(null);
          }
        });
      });
    });

    const bootstrap = async () => {
      try {
        const redirect = await consumeAuthRedirect();
        if (redirect.type === "recovery") setRecoveryFlow(true);
        const current = redirect.session ?? readPersistedSession();
        if (current && active && bootstrapEpoch === authEpoch.current) {
          const user = await getAuthenticatedUser(current);
          if (active && bootstrapEpoch === authEpoch.current) {
            const verifiedSession = { ...current, user };
            setSession(verifiedSession);
            const ownerWorkspace = await getOrCreateWorkspace(verifiedSession);
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

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [activateSession]);

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
    session,
    user: session?.user ?? null,
    workspace,
    loading,
    recoveryFlow,
    signIn,
    signUp,
    signOut,
    requestPasswordReset: reset,
    updatePassword,
  }), [session, workspace, loading, recoveryFlow, signIn, signUp, signOut, reset, updatePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
};
