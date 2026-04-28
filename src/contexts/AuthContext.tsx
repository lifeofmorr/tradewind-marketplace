/**
 * Phase 0 stub. Phase 1B fleshes out signIn/signUp/signOut + profile load.
 * The shape is final so main.tsx and route imports won't change.
 */
import { createContext, useContext, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/types/database";

interface AuthContextValue {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, full_name: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const stub: AuthContextValue = {
  loading: false,
  session: null,
  user: null,
  profile: null,
  role: null,
  signIn: async () => { throw new Error("AuthProvider not yet wired (Phase 1B)"); },
  signUp: async () => { throw new Error("AuthProvider not yet wired (Phase 1B)"); },
  signOut: async () => {},
  refreshProfile: async () => {},
};

const AuthContext = createContext<AuthContextValue>(stub);

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={stub}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
