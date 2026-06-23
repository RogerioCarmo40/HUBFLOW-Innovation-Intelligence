import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { ArrowLeft, Plus, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectStatusBadge, MaturityBadge, IdeaStatusBadge } from "@/components/Badges";
import { AgentCard } from "@/components/AgentCard";
import { SavedInsight } from "@/components/SavedInsight";
import { NewIdeaDialog } from "@/components/NewIdeaDialog";
import { useData } from "@/lib/store";
import { AGENTS, type AgentResult } from "@/lib/ai-agents";
import { runAgentFn } from "@/lib/agents.functions";

export const Route = createFileRoute("/_authenticated/projects/$id")({
  component: ProjectDetail,
});

const SCAN_SEQUENCE = ["MarketScout", "OpportunityMapper", "ThreatRisk", "WhyNotInnovate"] as const;

function ProjectDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { getProject, ideas, insightsForProject, addInsight, isLoading } = useData();
  const project = getProject(id);
  const [scanning, setScanning] = useState(false);
  const runAgent = useServerFn(runAgentFn);

  if (!project) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">{isLoading ? "Loading project…" : "Project not found."}</p>
        {!isLoading && (
          <Button className="mt-4" onClick={() => navigate({ to: "/projects" })}>
            Back to projects
          </Button>
        )}
      </div>
    );
  }

  const relatedIdeas = ideas.filter((i) => i.projectId === project.id);
  const insights = insightsForProject(project.id);

  const runFullScan = async () => {
    setScanning(true);
    toast.info("Running full innovation scan…");
    try {
      for (const type of SCAN_SEQUENCE) {
        const result = (await runAgent({
          data: { agentType: type, input: `${project.name} — ${project.sector}` },
        })) as AgentResult;
        await addInsight({ agentType: type, input: project.name, result, projectId: project.id });
      }
      toast.success("Full innovation scan complete.");
    } catch {
      toast.error("The scan could not be completed.");
    } finally {
      setScanning(false);
    }
  };


  return (
    <>
      <Link to="/projects" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{project.description}</p>
        </div>
        <Button onClick={runFullScan} disabled={scanning} className="gap-1.5">
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Run Full Innovation Scan
        </Button>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ideas">Ideas ({relatedIdeas.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights &amp; AI Scans ({insights.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCell label="Owner" value={project.owner} />
            <InfoCell label="Sector" value={project.sector} />
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Maturity</p>
              <div className="mt-2"><MaturityBadge maturity={project.maturity} /></div>
            </div>
            <InfoCell label="Created" value={format(new Date(project.createdAt), "MMM d, yyyy")} />
          </div>
        </TabsContent>

        <TabsContent value="ideas" className="mt-5">
          <div className="mb-3 flex justify-end">
            <NewIdeaDialog
              defaultProjectId={project.id}
              trigger={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> New Idea</Button>}
            />
          </div>
          {relatedIdeas.length === 0 ? (
            <EmptyState text="No ideas linked to this project yet." />
          ) : (
            <ul className="space-y-2">
              {relatedIdeas.map((i) => (
                <li key={i.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                  <div>
                    <Link to="/ideas/$id" params={{ id: i.id }} className="font-semibold hover:text-primary">
                      {i.title}
                    </Link>
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{i.description}</p>
                  </div>
                  <IdeaStatusBadge status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="insights" className="mt-5 space-y-6">
          <div>
            <h3 className="mb-3 font-bold">Run an agent on this project</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              {AGENTS.filter((a) => SCAN_SEQUENCE.includes(a.type as (typeof SCAN_SEQUENCE)[number])).map(
                (a) => (
                  <AgentCard
                    key={a.type}
                    agent={a}
                    onSaved={(input, result) =>
                      addInsight({ agentType: a.type, input, result, projectId: project.id })
                    }
                  />
                ),
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-bold">Saved insights ({insights.length})</h3>
            {insights.length === 0 ? (
              <EmptyState text="No insights yet. Run an agent or a full scan above." />
            ) : (
              <div className="space-y-4">
                {insights.map((ins) => (
                  <SavedInsight key={ins.id} insight={ins} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}