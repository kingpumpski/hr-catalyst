import { createClient, type Session, type User } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

export const isSupabaseConfigured = Boolean(supabase);

export const hasOwnerRole = (metadata: Record<string, unknown> | null | undefined) =>
  metadata?.role === "owner";

export type AuthState = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  isOwner: boolean;
};
