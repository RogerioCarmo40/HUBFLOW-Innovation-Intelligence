import { useState } from "react";
import {
  Search,
  Radar,
  Map,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  Users,
  Leaf,
  Sparkles,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentResultView } from "@/components/AgentResultView";
import type { AgentMeta, AgentResult } from "@/lib/ai-agents";
import { runAgentFn } from "@/lib/agents.functions";

const ICONS: Record<string, LucideIcon> = {
  Search,
  Radar,
  Map,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  Users,
  Leaf,
  Sparkles,
};

export function AgentCard({
  agent,
  onSaved,
}: {
  agent: AgentMeta;
  onSaved?: (input: string, result: AgentResult) => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const Icon = ICONS[agent.icon] ?? Sparkles;
  const runAgent = useServerFn(runAgentFn);

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = (await runAgent({ data: { agentType: agent.type, input } })) as AgentResult;
      setResult(res);
      onSaved?.(input, res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("RATE_LIMIT")) {
        toast.error("The AI is busy right now. Please try again in a moment.");
      } else if (msg.includes("CREDITS_EXHAUSTED")) {
        toast.error("AI credits are exhausted. Add credits to keep using the agents.");
      } else {
        toast.error("The agent could not complete the analysis.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-bold leading-tight">{agent.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{agent.description}</p>
        </div>
      </div>

      <label className="mt-4 text-xs font-semibold text-muted-foreground">{agent.inputLabel}</label>
      <div className="mt-1.5 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={agent.inputPlaceholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) handleRun();
          }}
        />
        <Button onClick={handleRun} disabled={loading} className="shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run"}
        </Button>
      </div>

      {result && (
        <div className="mt-5 border-t border-border pt-5">
          <AgentResultView result={result} />
        </div>
      )}
    </div>
  );
}