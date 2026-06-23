import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IdeaStatusBadge, IdeaTypeBadge, Pill } from "@/components/Badges";
import { AgentCard } from "@/components/AgentCard";
import { SavedInsight } from "@/components/SavedInsight";
import { useData } from "@/lib/store";
import { AGENTS } from "@/lib/ai-agents";

export const Route = createFileRoute("/_authenticated/ideas/$id")({
  component: IdeaDetail,
});

const NEXT_STEPS = [
  "Validate the core assumption with 5 target users.",
  "Run a Market Scout scan to benchmark pricing.",
  "Define a lightweight MVP scope and success metric.",
  "Identify one partner or channel to accelerate reach.",
];

function IdeaDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { getIdea, getProject, insightsForIdea, addInsight, isLoading } = useData();
  const idea = getIdea(id);

  if (!idea) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">{isLoading ? "Loading idea…" : "Idea not found."}</p>
        {!isLoading && (
          <Button className="mt-4" onClick={() => navigate({ to: "/ideas" })}>Back to ideas</Button>
        )}
      </div>
    );
  }

  const project = idea.projectId ? getProject(idea.projectId) : undefined;
  const insights = insightsForIdea(idea.id);
  const radarAgent = AGENTS.find((a) => a.type === "IdeaRadar")!;

  return (
    <>
      <Link to="/ideas" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to ideas
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <IdeaTypeBadge type={idea.type} />
        <IdeaStatusBadge status={idea.status} />
      </div>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight lg:text-3xl">{idea.title}</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{idea.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {idea.tags.map((t) => <Pill key={t} tone="gray">#{t}</Pill>)}
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="insights">Insights ({insights.length})</TabsTrigger>
          <TabsTrigger value="next">Next steps</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Cell label="Author" value={idea.author} />
            <Cell label="Sector" value={idea.sector} />
            <Cell label="Project" value={project?.name ?? "—"} />
            <Cell label="Created" value={format(new Date(idea.createdAt), "MMM d, yyyy")} />
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-5">
          <ul className="space-y-2">
            <HistoryRow date={idea.createdAt} text="Idea created" />
            <HistoryRow date={idea.createdAt} text={`Status set to "${idea.status}"`} />
          </ul>
        </TabsContent>

        <TabsContent value="insights" className="mt-5 space-y-6">
          <div>
            <h3 className="mb-3 font-bold">Analyze with AI Agent</h3>
            <AgentCard
              agent={radarAgent}
              onSaved={(input, result) =>
                addInsight({ agentType: "IdeaRadar", input: input || idea.title, result, ideaId: idea.id })
              }
            />
          </div>
          <div>
            <h3 className="mb-3 font-bold">Saved insights ({insights.length})</h3>
            {insights.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
                No insights yet. Run the agent above.
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((ins) => <SavedInsight key={ins.id} insight={ins} />)}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="next" className="mt-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-bold">Suggested next steps</h3>
            </div>
            <ol className="space-y-2">
              {NEXT_STEPS.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {idx + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function HistoryRow({ date, text }: { date: string; text: string }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm">
      <span>{text}</span>
      <span className="text-xs text-muted-foreground">{format(new Date(date), "MMM d, yyyy HH:mm")}</span>
    </li>
  );
}