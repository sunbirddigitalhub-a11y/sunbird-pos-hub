import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "master_admin" | "supervisor" | "staff";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  business_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  businessId: string | null;
  isGrandmaster: boolean;
  onboardingCompleted: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  isAdminOrSupervisor: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isGrandmaster, setIsGrandmaster] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout>>();

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (session) {
      inactivityTimer.current = setTimeout(async () => {
        await supabase.auth.signOut();
      }, INACTIVITY_TIMEOUT);
    }
  }, [session]);

  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivityTimer]);

  const fetchProfileAndRole = useCallback(async (userId: string) => {
    const [profileRes, roleRes, gmRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId).single(),
      supabase.from("grandmasters" as any).select("id").eq("user_id", userId).maybeSingle(),
    ]);
    if (profileRes.data) {
      const p = profileRes.data as any;
      setProfile(p as Profile);
      setBusinessId(p.business_id || null);
      // Check onboarding status
      if (p.business_id) {
        const { data: biz } = await supabase.from("businesses").select("onboarding_completed").eq("id", p.business_id).single();
        setOnboardingCompleted(!!(biz as any)?.onboarding_completed);
      }
    }
    if (roleRes.data) setRole((roleRes.data as any).role as AppRole);
    setIsGrandmaster(!!(gmRes.data));
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchProfileAndRole(session.user.id), 0);
      } else {
        setProfile(null);
        setRole(null);
        setBusinessId(null);
        setIsGrandmaster(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfileAndRole]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_logs").insert({
          action: "login",
          table_name: "auth",
          performed_by: user.id,
          details: { email } as any,
        });
      }
    }
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });
    return { error };
  };

  const signOut = async () => {
    if (user) {
      await supabase.from("audit_logs").insert({
        action: "logout",
        table_name: "auth",
        performed_by: user.id,
        details: { email: user.email } as any,
      });
    }
    await supabase.auth.signOut();
  };

  const hasRole = (r: AppRole) => role === r;
  const isAdminOrSupervisor = () => role === "master_admin" || role === "supervisor";

  return (
    <AuthContext.Provider value={{ user, session, profile, role, businessId, isGrandmaster, loading, signIn, signUp, signOut, hasRole, isAdminOrSupervisor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
