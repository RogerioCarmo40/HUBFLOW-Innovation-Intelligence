import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  Lightbulb,
  Sparkles,
  BarChart3,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/store";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "My Projects", icon: FolderKanban },
  { to: "/ideas", label: "Ideas", icon: Lightbulb },
  { to: "/insights-agents", label: "Insights & Agents", icon: Sparkles },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/welcome", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 brand-gradient text-primary-foreground shadow-soft">
        <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
          <button
            className="rounded-lg p-2 transition-colors hover:bg-white/15 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo
            iconClassName="bg-white/20 shadow-none"
            className="[&_span]:text-primary-foreground"
            subtitle="Innovation"
          />
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{user?.name}</p>
              <p className="text-xs text-primary-foreground/70">{user?.role}</p>
            </div>
            <Avatar className="h-9 w-9 border border-white/30">
              <AvatarFallback className="bg-white/20 text-sm font-semibold text-primary-foreground">
                {user ? initials(user.name) : "HF"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-r border-border bg-sidebar py-6 lg:flex">
          <NavLinks />
          <button
            onClick={handleLogout}
            className="mx-3 mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </aside>

        {/* Mobile drawer */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-16 items-center border-b px-4">
              <Logo subtitle="Innovation" />
            </div>
            <div className="py-4">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <button
              onClick={handleLogout}
              className="mx-3 flex w-[calc(100%-1.5rem)] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-[18px] w-[18px]" />
              Logout
            </button>
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}