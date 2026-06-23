import { format } from "date-fns";
import { Sparkles } from "lucide-react";

import { AgentResultView } from "@/components/AgentResultView";
import { getAgentMeta, type AgentResult } from "@/lib/ai-agents";
import type { Insight } from "@/lib/types";

export function SavedInsight({ insight }: { insight: Insight }) {
  const meta = getAgentMeta(insight.agentType);
  const result: AgentResult = {
    summary: insight.resultSummary,
    blocks: (insight.resultStructured as { blocks?: AgentResult["blocks"] }).blocks ?? [],
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="font-bold">{meta.name}</h4>
        </div>
        <span className="text-xs text-muted-foreground">
          {format(new Date(insight.createdAt), "MMM d, HH:mm")}
        </span>
      </div>
      <AgentResultView result={result} />
    </div>
  );
}
