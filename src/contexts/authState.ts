import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";

export type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  isOwner: boolean;
  signIn: (email: string, password: string) => Promise<Error | null>;
  signOut: () => Promise<Error | null>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
