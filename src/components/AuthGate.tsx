
import useAuth from "@/hooks/useAuth";
import useUserRoles from "@/hooks/useUserRoles";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

/**
 * AuthGate - restricts access to routes based on roles, using user_roles table.
 * @param role e.g. "passenger", "operator", "admin" or null for any logged in
 */
export default function AuthGate({
  role,
  children,
}: {
  role: "passenger" | "operator" | "admin" | null;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const { roles, loading: rolesLoading } = useUserRoles();

  if (loading || rolesLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && !roles.includes(role)) {
    return <div className="p-8 text-center text-red-500">Not authorized (missing role: {role}).</div>;
  }
  return <>{children}</>;
}
