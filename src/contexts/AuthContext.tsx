import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthUser = {
  id: string;
  email: string;
  role: "passenger" | "operator" | "admin" | null;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (
    email: string,
    password: string,
    role: AuthUser["role"],
    fullName?: string
  ) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from Supabase (session)
  const refreshUser = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      setUser(null);
      setLoading(false);
      return;
    }
    const role =
      data.user.user_metadata.role ||
      (data.user.app_metadata?.role as AuthUser["role"]) ||
      null;
    setUser({
      id: data.user.id,
      email: data.user.email ?? "",
      role,
    });
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
    // Listen for changes in auth state (login, logout)
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshUser();
    });
    return () => sub.subscription?.unsubscribe?.();
    // eslint-disable-next-line
  }, []);

  // Auth functions
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    await refreshUser();
    return {};
  };

  const signup = async (
    email: string,
    password: string,
    role: AuthUser["role"],
    fullName?: string
  ) => {
    const options: any = {
      data: { role },
    };
    if (fullName) {
      // This will be mapped to raw_user_meta_data on the user object, letting our trigger capture it for profiles.full_name
      options.data.full_name = fullName;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    if (error) return { error: error.message };
    await refreshUser();
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
