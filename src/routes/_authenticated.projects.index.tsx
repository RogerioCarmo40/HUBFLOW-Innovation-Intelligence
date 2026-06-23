import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { Plus, Eye, ScanSearch } from "lucide-react";

import { PageHeader } from "@/components/Primitives";
import { ProjectStatusBadge, MaturityBadge } from "@/components/Badges";
import { Button } from "@/components/ui/button";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { useData } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/projects/")({
  head: () => ({ meta: [{ title: "My Projects · HUBFLOW" }] }),
  component: Projects,
});

function Projects() {
  const { projects } = useData();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="My Projects"
        subtitle="Manage your innovation projects and run AI scans."
        action={
          <NewProjectDialog
            trigger={
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> New Project
              </Button>
            }
          />
        }
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="hidden grid-cols-12 gap-4 border-b border-border bg-secondary/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span className="col-span-4">Project</span>
          <span className="col-span-2">Owner</span>
          <span className="col-span-2">Sector</span>
          <span className="col-span-2">Maturity</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>
        <ul className="divide-y divide-border">
          {projects.map((p) => (
            <li key={p.id} className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-12 md:items-center md:gap-4">
              <div className="md:col-span-4">
                <div className="flex items-center gap-2">
                  <Link to="/projects/$id" params={{ id: p.id }} className="font-semibold hover:text-primary">
                    {p.name}
                  </Link>
                  <ProjectStatusBadge status={p.status} />
                </div>
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{p.description}</p>
              </div>
              <div className="text-sm text-muted-foreground md:col-span-2">{p.owner}</div>
              <div className="text-sm md:col-span-2">{p.sector}</div>
              <div className="md:col-span-2"><MaturityBadge maturity={p.maturity} /></div>
              <div className="flex gap-2 md:col-span-2 md:justify-end">
                <Link to="/projects/$id" params={{ id: p.id }}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Eye className="h-4 w-4" /> View
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => navigate({ to: "/projects/$id", params: { id: p.id } })}
                >
                  <ScanSearch className="h-4 w-4" /> AI Scan
                </Button>
              </div>
              <p className="text-xs text-muted-foreground md:hidden">
                Created {format(new Date(p.createdAt), "MMM d, yyyy")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}