import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, ShieldAlert, TrendingUp } from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "HUBFLOW – Transform your ideas into innovation" },
      {
        name: "description",
        content:
          "HUBFLOW is an innovation intelligence platform. Use AI agents to scan markets, map opportunities, and de-risk your next big idea.",
      },
    ],
  }),
  component: Welcome,
});

const HIGHLIGHTS = [
  { icon: Sparkles, title: "8 specialized AI agents", text: "Market, ideas, opportunities & more." },
  { icon: TrendingUp, title: "Spot opportunities", text: "Find white spaces before competitors." },
  { icon: ShieldAlert, title: "De-risk decisions", text: "Surface threats and barriers early." },
];

function Welcome() {
  return (
    <div className="flex min-h-screen flex-col hero-gradient">
      <header className="flex items-center justify-between px-6 py-5 lg:px-10">
        <Logo subtitle="Innovation" />
        <Link to="/auth/sign-in">
          <Button variant="ghost">Sign In</Button>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-soft">
          <Sparkles className="h-4 w-4 text-primary" />
          Innovation Intelligence, powered by AI
        </span>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Transform your ideas into <span className="text-gradient">innovation</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Turn market noise into innovation insights. Ask the AI Agents to scan your market before
          investing in a new idea.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/auth/sign-in">
            <Button size="lg" className="gap-2">
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button size="lg" variant="outline">
              Create Account
            </Button>
          </Link>
        </div>

        <div className="mt-14 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="rounded-2xl border border-border bg-card p-5 text-left shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <h.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-bold">{h.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{h.text}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HUBFLOW · Innovation Intelligence
      </footer>
    </div>
  );
}