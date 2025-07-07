
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { User } from "lucide-react";
import useUserRoles from "@/hooks/useUserRoles";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function MainLayout() {
  const [role, setRole] = useState<"passenger" | "operator" | "admin" | null>(null);
  const { user, logout } = useAuth();
  const { roles, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  // Sidebar: pass the highest priority role for backward compat/sidebar logic if needed
  let sidebarRole: "admin" | "operator" | "passenger" | null = null;
  if (roles.includes("admin")) sidebarRole = "admin";
  else if (roles.includes("operator")) sidebarRole = "operator";
  else if (roles.includes("passenger")) sidebarRole = "passenger";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar role={sidebarRole} />
        <div className="flex-1 flex flex-col">
          <header className="flex items-center border-b px-4 h-14 justify-between gap-2 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
            <SidebarTrigger />
            <div className="flex gap-2 items-center">
              <ThemeSwitcher />
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground px-2">
                    {user.email} • {roles.join(", ").toUpperCase() || "No Role"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="hover:scale-105 duration-150"
                    aria-label="Profile"
                  >
                    <Link to="/profile">
                      <User />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <select
                    className="bg-muted rounded px-2 py-1 text-sm"
                    value={role ?? ""}
                    onChange={(e) =>
                      setRole(
                        e.target.value
                          ? (e.target.value as "passenger" | "operator" | "admin")
                          : null
                      )
                    }
                  >
                    <option value="">Select Role</option>
                    <option value="passenger">Passenger</option>
                    <option value="operator">Bus Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/register")}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 flex flex-col">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
