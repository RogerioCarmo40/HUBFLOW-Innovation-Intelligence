import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  User as UserIcon,
  Bell,
  SlidersHorizontal,
  LifeBuoy,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · HUBFLOW" }] }),
  component: SettingsPage,
});

const ITEMS = [
  { icon: Bell, label: "Notifications", desc: "Configure alerts and emails" },
  { icon: SlidersHorizontal, label: "Preferences", desc: "Customize your workspace" },
  { icon: LifeBuoy, label: "Help & Support", desc: "Get help and contact us" },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [push, setPush] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", role: "" });

  useEffect(() => {
    if (user) setForm({ name: user.name, company: user.company, role: user.role });
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/welcome", replace: true });
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await updateUser({
      name: form.name.trim(),
      company: form.company.trim(),
      role: form.role.trim(),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Profile updated.");
      setEditing(false);
    } else {
      toast.error(res.error ?? "Could not update your profile.");
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your account and preferences." />

      <div className="mx-auto max-w-2xl space-y-5">
        {/* Profile card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="brand-gradient text-lg font-bold text-primary-foreground">
                {user ? initials(user.name) : "HF"}
              </AvatarFallback>
            </Avatar>
            {!editing ? (
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">{user?.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                <p className="mt-1 text-sm font-medium text-primary">{user?.role}</p>
                <p className="text-sm text-muted-foreground">{user?.company}</p>
              </div>
            ) : (
              <div className="min-w-0 flex-1 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="s-name">Name</Label>
                  <Input
                    id="s-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-company">Company</Label>
                  <Input
                    id="s-company"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-role">Role</Label>
                  <Input
                    id="s-role"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() => {
                    setEditing(false);
                    if (user) setForm({ name: user.name, company: user.company, role: user.role });
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" disabled={saving} onClick={handleSave}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
                <UserIcon className="h-4 w-4" /> Edit profile
              </Button>
            )}
          </div>
        </div>

        {/* Push notifications */}
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Receive alerts about scans and updates</p>
            </div>
          </div>
          <Switch
            checked={push}
            onCheckedChange={(v) => {
              setPush(v);
              toast.success(v ? "Push notifications enabled" : "Push notifications disabled");
            }}
          />
        </div>

        {/* Menu items */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <ul className="divide-y divide-border">
            {ITEMS.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => toast.info(`${item.label} is coming soon.`)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* App information */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-bold">App Information</h3>
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="Version" value="1.0.0" />
            <Row label="Build" value="2026.06.22" />
            <Row label="Environment" value="Lovable Cloud" />
          </dl>
        </div>

        <Button variant="destructive" className="w-full gap-2" size="lg" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}