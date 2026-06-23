import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "Create Account · HUBFLOW" }] }),
  component: Register,
});

function Register() {
  const { register } = useAuth();
  
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await register({
      name: form.name,
      company: form.company,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (res.ok) {
      window.location.assign("/dashboard");
    } else {
      setError(res.error ?? "Registration failed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center hero-gradient px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo subtitle="Innovation" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
          <h1 className="text-2xl font-extrabold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start turning market noise into innovation insights.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={form.name} onChange={set("name")} placeholder="Jane Doe" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                required
                value={form.company}
                onChange={set("company")}
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="you@company.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating…" : "Create Account"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or sign up with
            <span className="h-px flex-1 bg-border" />
          </div>

          <SocialAuthButtons />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/sign-in" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}