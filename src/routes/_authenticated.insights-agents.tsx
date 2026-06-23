import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/Primitives";
import { AgentCard } from "@/components/AgentCard";
import { AGENTS } from "@/lib/ai-agents";
import { useData } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/insights-agents")({
  head: () => ({ meta: [{ title: "Insights & Agents · HUBFLOW" }] }),
  component: InsightsAgents,
});

function InsightsAgents() {
  const { addInsight } = useData();

  return (
    <>
      <PageHeader
        title="Insights & Agents"
        subtitle="Ask the AI Agents to scan your market before investing in a new idea."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {AGENTS.map((agent) => (
          <AgentCard
            key={agent.type}
            agent={agent}
            onSaved={(input, result) => addInsight({ agentType: agent.type, input, result })}
          />
        ))}
      </div>
    </>
  );
}