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

export const isSupabaseConfigured = () => Boolean(API_URL && API_KEY);

const getApiKey = () => {
  if (!API_URL || !API_KEY) throw new Error("Account access is not configured yet. Please contact the HR Catalyst administrator.");
  return API_KEY;
};

export const requestSupabase = async <T>(
  path: string,
  options: { method?: string; body?: unknown; accessToken?: string; prefer?: string } = {},
): Promise<T> => {
  const headers = new Headers({ apikey: getApiKey(), Accept: "application/json" });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.accessToken) headers.set("Authorization", `Bearer ${options.accessToken}`);
  if (options.prefer) headers.set("Prefer", options.prefer);
  const response = await fetch(`${API_URL}${path}`, {
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

const normalizeSession = (value: AuthResponse, fallbackUser?: AuthUser): AuthSession | null => {
  if (!value.access_token || !value.refresh_token) return null;
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

export const persistSession = (session: AuthSession | null) => {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const readPersistedSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? "null");
    if (!value || typeof value !== "object") return null;
    const candidate = value as Partial<AuthSession>;
    return candidate.access_token && candidate.refresh_token && candidate.user?.id &&
      Number.isFinite(candidate.expires_at) ? candidate as AuthSession : null;
  } catch {
    return null;
  }
};

export const signUpWithPassword = async (email: string, password: string, fullName: string) => {
  const result = await requestSupabase<AuthResponse>("/auth/v1/signup", {
    method: "POST",
    body: { email: email.trim().toLowerCase(), password, data: { full_name: fullName.trim() } },
  });
  const session = normalizeSession(result);
  if (session) persistSession(session);
  return { user: result.user ?? session?.user ?? null, session };
};

export const signInWithPassword = async (email: string, password: string) => {
  const result = await requestSupabase<AuthResponse>("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email: email.trim().toLowerCase(), password },
  });
  const session = normalizeSession(result);
  if (!session) throw new Error("The sign-in response did not contain a valid session.");
  persistSession(session);
  return session;
};

export const refreshAuthSession = async (session: AuthSession) => {
  const result = await requestSupabase<AuthResponse>("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: { refresh_token: session.refresh_token },
  });
  const next = normalizeSession(result, session.user);
  if (!next) throw new Error("Your session could not be refreshed. Please sign in again.");
  persistSession(next);
  return next;
};

export const getAuthenticatedUser = async (session: AuthSession) =>
  requestSupabase<AuthUser>("/auth/v1/user", { accessToken: session.access_token });

export const requestPasswordReset = async (email: string) => {
  const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}auth?mode=recovery`;
  await requestSupabase<unknown>("/auth/v1/recover", {
    method: "POST",
    body: { email: email.trim().toLowerCase(), redirect_to: redirectTo },
  });
};

export const updateAccountPassword = async (session: AuthSession, password: string) => {
  await requestSupabase<AuthUser>("/auth/v1/user", {
    method: "PUT",
    accessToken: session.access_token,
    body: { password },
  });
};

export const signOutFromSupabase = async (session: AuthSession | null) => {
  try {
    if (session) await requestSupabase<unknown>("/auth/v1/logout", { method: "POST", accessToken: session.access_token });
  } finally {
    persistSession(null);
  }
};

export const consumeAuthRedirect = async (): Promise<{ session: AuthSession | null; type: string | null }> => {
  if (typeof window === "undefined") return { session: null, type: null };
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const type = params.get("type");
  if (!accessToken || !refreshToken) return { session: null, type };
  const user = await requestSupabase<AuthUser>("/auth/v1/user", { accessToken });
  const expiresIn = Number(params.get("expires_in") ?? 3600);
  const session: AuthSession = {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: params.get("token_type") ?? "bearer",
    expires_in: expiresIn,
    expires_at: Number(params.get("expires_at") ?? Math.floor(Date.now() / 1000) + expiresIn),
    user,
  };
  persistSession(session);
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  return { session, type };
};

export const getOrCreateWorkspace = async (session: AuthSession): Promise<Workspace> => {
  const query = `/rest/v1/workspaces?select=id,name&owner_id=eq.${encodeURIComponent(session.user.id)}&limit=1`;
  const existing = await requestSupabase<Workspace[]>(query, { accessToken: session.access_token });
  if (existing[0]) return existing[0];
  const created = await requestSupabase<Workspace[]>("/rest/v1/workspaces", {
    method: "POST",
    accessToken: session.access_token,
    prefer: "return=representation",
    body: { owner_id: session.user.id, name: "My HR Catalyst workspace" },
  });
  if (!created[0]) throw new Error("Your account is active, but its private workspace could not be created.");
  return created[0];
};

const encodeStoragePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

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
  const response = await fetch(`${API_URL}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`, {
    method: "POST",
    headers: {
      apikey: getApiKey(),
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: file,
    cache: "no-store",
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string; error?: string } | null;
    throw new Error(payload?.message ?? payload?.error ?? `Private file upload failed (${response.status}).`);
  }
};

export const removePrivateStorageObject = async (
  session: AuthSession,
  bucket: string,
  path: string,
) => {
  const response = await fetch(`${API_URL}/storage/v1/object/${encodeURIComponent(bucket)}`, {
    method: "DELETE",
    headers: {
      apikey: getApiKey(),
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [path] }),
    cache: "no-store",
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string; error?: string } | null;
    throw new Error(payload?.message ?? payload?.error ?? `Private file cleanup failed (${response.status}).`);
  }
};
