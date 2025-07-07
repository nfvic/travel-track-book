
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import BackButton from "@/components/BackButton";

export default function Login() {
  const { login, loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  if (user) {
    // Redirect based on role
    if (user.role === "operator") navigate("/operator");
    else if (user.role === "admin") navigate("/admin");
    else navigate("/passenger");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await login(email, password);
    if (res.error) {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-sm w-full bg-background/90 backdrop-blur-sm border p-8 rounded-lg shadow-lg">
        <BackButton />
        <h1 className="text-xl font-bold mb-3">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button disabled={loading} className="w-full" type="submit">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <div className="mt-4 text-sm">
          Don't have an account?{" "}
          <Link className="underline" to="/register">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
