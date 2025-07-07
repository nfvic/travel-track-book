
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import BackButton from "@/components/BackButton";
import useUserRoles from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

type AppRole = "passenger" | "operator" | "admin";

export default function Register() {
  const { signup, loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<AppRole[]>(["passenger"]);
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  if (user) {
    navigate("/"); // Redirect if already signed in
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { error } = await signup(email, password, roles[0], fullName);

      if (error) {
        setError(error);
        toast({
          title: "Registration failed",
          description: error,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Additional roles
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id;
      if (uid && roles.length > 1) {
        for (const role of roles.slice(1)) {
          await supabase.from("user_roles" as any).upsert({ user_id: uid, role });
        }
      }

      // Success: Give friendly feedback
      toast({
        title: "Registration successful!",
        description:
          "Check your email for a confirmation link or proceed to login.",
        variant: "default",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (e: any) {
      setError("An unexpected error occurred. Please try again.");
      toast({
        title: "Registration error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const allRoles: { label: string; value: AppRole }[] = [
    { label: "Passenger", value: "passenger" },
    { label: "Operator", value: "operator" },
    { label: "Admin", value: "admin" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-sm w-full bg-background/90 backdrop-blur-sm border p-8 rounded-lg shadow-lg">
        <BackButton />
        <h1 className="text-xl font-bold mb-3">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div>
            <span className="block mb-2 font-medium">Select Role(s):</span>
            <div className="flex flex-col gap-2">
              {allRoles.map((role) => (
                <div key={role.value} className="flex items-center gap-2">
                  <Checkbox
                    id={role.value}
                    checked={roles.includes(role.value)}
                    onCheckedChange={checked => {
                      const isChecked = !!checked;
                      if (isChecked) {
                        setRoles([...roles, role.value]);
                      } else {
                        setRoles(roles.filter(r => r !== role.value));
                      }
                    }}
                    disabled={
                      roles.length === 1 && roles[0] === role.value
                    }
                  />
                  <label htmlFor={role.value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {role.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <Button disabled={loading || submitting} className="w-full" type="submit">
            {loading || submitting ? "Registering..." : "Register"}
          </Button>
        </form>
        {error && (
          <div className="text-destructive mt-2 text-sm font-medium border border-destructive/50 rounded p-2 bg-destructive/10">
            {error}
          </div>
        )}
        <div className="mt-4 text-sm">
          Already have an account?{" "}
          <Link className="underline" to="/login">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
