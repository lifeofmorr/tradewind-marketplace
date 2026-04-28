import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();
    if (error) {
      console.warn("[auth] profile load failed:", error.message);
      setProfile(null);
      return;
    }
    setProfile((data as Profile | null) ?? null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) { setProfile(null); return; }
    await loadProfile(user.id);
  }, [user, loadProfile]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      if (data.session?.user) await loadProfile(data.session.user.id);
      if (mounted) setLoading(false);
    })().catch((e: unknown) => console.warn("[auth] init failed", e));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        void loadProfile(sess.user.id);
      } else {
        setProfile(null);
      }
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    full_name: string,
    role: UserRole = "buyer",
  ) => {
    if (role === "admin") throw new Error("admin signup is not allowed");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, role } },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  }, []);

  const value: AuthContextValue = {
    loading,
    session,
    user,
    profile,
    role: profile?.role ?? null,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
