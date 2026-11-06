import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type AuthUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  user: AuthUser;
};

export type Workspace = { id: string; name: string };

type AuthResponse = Partial<AuthSession> & { user?: AuthUser; msg?: string; message?: string; error_description?: string };

const SESSION_KEY = "hr-catalyst:supabase-auth-session";
const API_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/+$/, "");
const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
let supabaseClient: SupabaseClient<Database> | null = null;

export const isSupabaseConfigured = () => Boolean(API_URL && API_KEY);

const getApiUrl = () => {
  if (!API_URL) throw new Error("Account access is not configured yet. Please contact the HR Catalyst administrator.");
  return API_URL;
};

const getApiKey = () => {
  if (!API_KEY) throw new Error("Account access is not configured yet. Please contact the HR Catalyst administrator.");
  return API_KEY;
};

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(getApiUrl(), getApiKey(), {
      auth: {
        storageKey: SESSION_KEY,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "implicit",
      },
    });
  }
  return supabaseClient;
};

export const toAuthSession = (value: Session | null, fallbackUser?: AuthUser): AuthSession | null => {
  if (!value?.access_token || !value.refresh_token) return null;
  const user = value.user ?? fallbackUser;
  if (!user?.id) return null;
  const expiresIn = Number(value.expires_in ?? 3600);
  return {
    access_token: value.access_token,
    refresh_token: value.refresh_token,
    token_type: value.token_type ?? "bearer",
    expires_in: expiresIn,
    expires_at: Number(value.expires_at ?? Math.floor(Date.now() / 1000) + expiresIn),
    user,
  };
};

export const readPersistedSession = async (): Promise<AuthSession | null> => {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw error;
  return toAuthSession(data.session);
};

export const requestSupabase = async <T>(
  path: string,
  options: { method?: string; body?: unknown; accessToken?: string; prefer?: string } = {},
): Promise<T> => {
  const headers = new Headers({ apikey: getApiKey(), Accept: "application/json" });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.accessToken) headers.set("Authorization", `Bearer ${options.accessToken}`);
  if (options.prefer) headers.set("Prefer", options.prefer);
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as (AuthResponse & Record<string, unknown>) | null;
  if (!response.ok) {
    const message = payload?.msg ?? payload?.message ?? payload?.error_description ?? payload?.error;
    throw new Error(typeof message === "string" ? message : `Account request failed (${response.status}).`);
  }
  return payload as T;
};

export const signUpWithPassword = async (email: string, password: string, fullName: string) => {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { full_name: fullName.trim() } },
  });
  if (error) throw error;
  const session = toAuthSession(data.session);
  return { user: data.user ?? session?.user ?? null, session };
};

export const signInWithPassword = async (email: string, password: string) => {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  const session = toAuthSession(data.session);
  if (!session) throw new Error("The sign-in response did not contain a valid session.");
  return session;
};

export const refreshAuthSession = async (session: AuthSession, persist = true) => {
  const client = persist
    ? getSupabaseClient()
    : createClient(getApiUrl(), getApiKey(), {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
  const { data, error } = await client.auth.refreshSession({ refresh_token: session.refresh_token });
  if (error) throw error;
  const next = toAuthSession(data.session, session.user);
  if (!next) throw new Error("Your session could not be refreshed. Please sign in again.");
  return next;
};

export const getAuthenticatedUser = async (session: AuthSession) => {
  const { data, error } = await getSupabaseClient().auth.getUser(session.access_token);
  if (error) throw error;
  return data.user as AuthUser;
};

export const requestPasswordReset = async (email: string) => {
  const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}auth?mode=recovery`;
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
  if (error) throw error;
};

export const updateAccountPassword = async (_session: AuthSession, password: string) => {
  const { error } = await getSupabaseClient().auth.updateUser({ password });
  if (error) throw error;
};

export const signOutFromSupabase = async (_session: AuthSession | null) => {
  const client = getSupabaseClient();
  const { error } = await client.auth.signOut();
  if (error) {
    try {
      await client.auth.signOut({ scope: "local" });
    } catch {
      // The local auth event still clears the application state; preserve the original server error.
    }
    throw error;
  }
};

export const consumeAuthRedirect = async (): Promise<{ session: AuthSession | null; type: string | null }> => {
  if (typeof window === "undefined") return { session: null, type: null };
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const type = params.get("type");
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw error;
  const session = toAuthSession(data.session);
  if (session && (params.has("access_token") || params.has("code"))) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
  return { session, type };
};

export const getOrCreateWorkspace = async (session: AuthSession): Promise<Workspace> => {
  const client = getSupabaseClientForSession(session);
  const { data: existing, error: lookupError } = await client
    .from("workspaces")
    .select("id,name")
    .eq("owner_id", session.user.id)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return existing;

  const { data: created, error: insertError } = await client
    .from("workspaces")
    .insert({ owner_id: session.user.id, name: "My HR Catalyst workspace" })
    .select("id,name")
    .single();
  if (created) return created;

  // Another browser tab may win the unique-owner insert after our initial lookup.
  if (insertError?.code === "23505") {
    const { data: concurrentWorkspace, error: retryError } = await client
      .from("workspaces")
      .select("id,name")
      .eq("owner_id", session.user.id)
      .maybeSingle();
    if (!retryError && concurrentWorkspace) return concurrentWorkspace;
    if (retryError) throw retryError;
  }
  if (insertError) throw insertError;
  throw new Error("Your account is active, but its private workspace could not be created.");
};

export const getSupabaseClientForSession = (session: AuthSession) => createClient<Database>(getApiUrl(), getApiKey(), {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { headers: { Authorization: `Bearer ${session.access_token}` } },
});

export const uploadPrivateStorageObject = async (
  session: AuthSession,
  bucket: string,
  path: string,
  file: Blob,
  contentType: string,
) => {
  if (!path || path.startsWith("/") || path.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error("The private file path is invalid.");
  }
  const { error } = await getSupabaseClientForSession(session).storage.from(bucket).upload(path, file, {
    contentType,
    upsert: true,
    cacheControl: "3600",
  });
  if (error) throw new Error(error.message || "Private file upload failed.");
};

export const removePrivateStorageObject = async (
  session: AuthSession,
  bucket: string,
  path: string,
) => {
  if (!path || path.startsWith("/") || path.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error("The private file path is invalid.");
  }
  const { error } = await getSupabaseClientForSession(session).storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message || "Private file cleanup failed.");
};
