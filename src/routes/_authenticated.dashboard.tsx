import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Lightbulb, Loader2, CheckCircle2, Archive, Plus, ArrowRight } from "lucide-react";

import { PageHeader, StatCard } from "@/components/Primitives";
import { ProjectStatusBadge } from "@/components/Badges";
import { Button } from "@/components/ui/button";
import { useData } from "@/lib/store";
import { NewProjectDialog } from "@/components/NewProjectDialog";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · HUBFLOW" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { projects, ideas } = useData();

  const stats = {
    total: ideas.length,
    inProgress: projects.filter((p) => p.status === "InProgress").length,
    approved: projects.filter((p) => p.status === "Approved").length,
    archived: projects.filter((p) => p.status === "Archived").length,
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Turn market noise into innovation insights."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Ideas" value={stats.total} icon={Lightbulb} tone="blue" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Loader2} tone="amber" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} tone="green" />
        <StatCard label="Archived" value={stats.archived} icon={Archive} tone="gray" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Innovation Pipeline</h2>
            <NewProjectDialog
              trigger={
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> New Project
                </Button>
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <Link
                key={p.id}
                to="/projects/$id"
                params={{ id: p.id }}
                className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold leading-tight group-hover:text-primary">{p.name}</h3>
                  <ProjectStatusBadge status={p.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {p.sector} · {format(new Date(p.createdAt), "MMM d, yyyy")}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <aside>
          <h2 className="mb-3 text-lg font-bold">Quick Stats</h2>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <ul className="divide-y divide-border">
              {[
                ["Total Ideas", stats.total],
                ["In Progress", stats.inProgress],
                ["Approved", stats.approved],
                ["Archived", stats.archived],
              ].map(([label, value]) => (
                <li key={label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-lg font-bold">{value}</span>
                </li>
              ))}
            </ul>
            <Link to="/reports" className="mt-4 block">
              <Button variant="outline" className="w-full gap-1.5">
                View Detailed Reports <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}