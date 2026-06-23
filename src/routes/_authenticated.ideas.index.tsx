import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/Primitives";
import { IdeaStatusBadge, IdeaTypeBadge, Pill } from "@/components/Badges";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewIdeaDialog } from "@/components/NewIdeaDialog";
import { useData } from "@/lib/store";
import type { IdeaStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/ideas/")({
  head: () => ({ meta: [{ title: "Ideas · HUBFLOW" }] }),
  component: Ideas,
});

const STATUS_OPTIONS: (IdeaStatus | "all")[] = [
  "all",
  "Draft",
  "InReview",
  "Approved",
  "Rejected",
  "Archived",
];

function Ideas() {
  const { ideas } = useData();
  const [status, setStatus] = useState<string>("all");
  const [sector, setSector] = useState<string>("all");

  const sectors = useMemo(
    () => ["all", ...Array.from(new Set(ideas.map((i) => i.sector)))],
    [ideas],
  );

  const filtered = ideas
    .filter((i) => status === "all" || i.status === status)
    .filter((i) => sector === "all" || i.sector === sector);

  return (
    <>
      <PageHeader
        title="Ideas"
        subtitle="Capture, filter and analyze ideas with AI agents."
        action={
          <NewIdeaDialog
            trigger={
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> New Idea
              </Button>
            }
          />
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? "All statuses" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Sector" /></SelectTrigger>
          <SelectContent>
            {sectors.map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? "All sectors" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
          No ideas match your filters.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((idea) => (
            <Link
              key={idea.id}
              to="/ideas/$id"
              params={{ id: idea.id }}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <IdeaTypeBadge type={idea.type} />
                <IdeaStatusBadge status={idea.status} />
              </div>
              <h3 className="mt-3 font-bold leading-tight group-hover:text-primary">{idea.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{idea.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {idea.tags.map((t) => (
                  <Pill key={t} tone="gray">#{t}</Pill>
                ))}
              </div>
              <p className="mt-auto pt-4 text-xs text-muted-foreground">
                {idea.sector} · {format(new Date(idea.createdAt), "MMM d, yyyy")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
