
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";

/**
 * Returns the array of roles (`admin`, `operator`, `passenger`, etc) for the current user.
 * NOTE: 'user_roles' is not present in Supabase types, so we skip TS generics and cast manually.
 */
export default function useUserRoles() {
  const { user } = useAuth();
  // Use string[] for loose shape
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // Bypass types completely for "user_roles"
    (async () => {
      // Use any here to avoid type errors
      const { data, error } = await (supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id) as any);

      setRoles(data && Array.isArray(data) ? data.map((r: any) => r.role) : []);
      setLoading(false);
    })();
  }, [user]);

  return { roles, loading };
}
