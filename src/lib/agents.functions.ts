// =============================================================================
// HUBFLOW AI Agents — REAL integration via Lovable AI Gateway
//
// Each agent is a structured analysis task. The server function below sends the
// user's context to a real LLM and parses a normalized JSON response into the
// AgentResult shape the UI already renders. If the model is unavailable or the
// response can't be parsed, it falls back to the local simulated runner so the
// UI never breaks.
// =============================================================================

import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AgentType } from "./types";
import {
  getAgentMeta,
  runAgent as runSimulatedAgent,
  type BlockKind,
  type CardItem,
  type ListItem,
  type ScoreItem,
} from "./ai-agents";

// Serializable result shape returned over the wire (data is a concrete union,
// not `unknown`, so TanStack's server-fn serializer accepts it). On the client
// this is treated as an AgentResult.
type ResultBlockData = string | string[] | ScoreItem | ListItem[] | CardItem[];
export type AgentResultBlock = { heading: string; kind: BlockKind; data: ResultBlockData };
export type AgentResult = { summary: string; blocks: AgentResultBlock[] };

const AGENT_GOALS: Record<AgentType, string> = {
  MarketScout:
    "Scan the market for pricing and positioning. Use 'cards' for sampled price tiers (low-cost / mainstream / premium with ranges and sample vendor archetypes) and a 'list' summarizing average price, positioning and the clearest pricing opportunity.",
  IdeaRadar:
    "Compare the idea against existing solutions. Include a 'score' block (0-100 novelty), a 'list' of similar existing ideas with similarity badges/tone, and a 'tags' block of white spaces.",
  OpportunityMapper:
    "Map innovation opportunities. Include a 'tags' block of macro trends, a 'tags' block of market gaps, and a 'cards' block of potential innovations with Impact / Complexity / Horizon fields.",
  ThreatRisk:
    "Assess threats and risks. Use separate 'list' blocks for Market, Technology, Regulatory and Competitive threats. Each item should include a mitigation in 'detail', a probability/impact 'badge' and a tone.",
  WhyNotInnovate:
    "List barriers to innovation. Use 'list' blocks for Cultural, Financial, Technological and Regulatory barriers (each with how to overcome it in 'detail'), then a closing 'paragraph' on why innovating anyway matters.",
  TrendsBenchmark:
    "Analyze trends and benchmark competitors. Include 'tags' for global trends, 'tags' for local trends, a 'cards' block of competitor archetypes with their innovation strategy, and a 'list' of business model suggestions.",
  ConsumerInsight:
    "Bring consumer behavior insights. Include 'tags' for consumer behaviors, 'tags' for pain points, a 'cards' block of personas (with driver and channel), and a 'tags' block of partnership opportunities.",
  ImpactSustainability:
    "Evaluate social and environmental impact. Include a 'list' of social impacts, a 'list' of environmental impacts (positive and negative, with tone), a 'tags' block of ESG considerations, and a 'tags' block of sustainability opportunities.",
};

const TONES = ["low", "medium", "high", "neutral"] as const;
function toTone(v: unknown): ListItem["tone"] {
  return (TONES as readonly string[]).includes(v as string) ? (v as ListItem["tone"]) : undefined;
}

function normalizeBlocks(raw: unknown): AgentResultBlock[] {
  if (!Array.isArray(raw)) return [];
  const out: AgentResultBlock[] = [];
  for (const b of raw) {
    if (!b || typeof b !== "object") continue;
    const block = b as Record<string, unknown>;
    const heading = String(block.heading ?? "");
    const kind = block.kind as BlockKind;
    let data: ResultBlockData;
    switch (kind) {
      case "tags":
        data = Array.isArray(block.tags) ? block.tags.map((t) => String(t)) : [];
        break;
      case "paragraph":
        data = String(block.paragraph ?? "");
        break;
      case "score": {
        const s = (block.score ?? {}) as Record<string, unknown>;
        data = { value: Number(s.value ?? 0), label: String(s.label ?? "") } satisfies ScoreItem;
        break;
      }
      case "list":
        data = (Array.isArray(block.list) ? block.list : []).map((raw) => {
          const it = (raw ?? {}) as Record<string, unknown>;
          return {
            label: String(it.label ?? ""),
            detail: it.detail ? String(it.detail) : undefined,
            badge: it.badge ? String(it.badge) : undefined,
            tone: toTone(it.tone),
          } satisfies ListItem;
        });
        break;
      case "cards":
        data = (Array.isArray(block.cards) ? block.cards : []).map((raw) => {
          const c = (raw ?? {}) as Record<string, unknown>;
          const fields = (Array.isArray(c.fields) ? c.fields : []).map((rf) => {
            const f = (rf ?? {}) as Record<string, unknown>;
            return { label: String(f.label ?? ""), value: String(f.value ?? "") };
          });
          return { title: String(c.title ?? ""), fields } satisfies CardItem;
        });
        break;
      default:
        continue;
    }
    out.push({ heading, kind, data });
  }
  return out;
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model response");
  return JSON.parse(candidate.slice(start, end + 1));
}

export const runAgentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { agentType: AgentType; input: string }) => {
    if (!data || typeof data.agentType !== "string") {
      throw new Error("agentType is required");
    }
    return { agentType: data.agentType, input: String(data.input ?? "").slice(0, 2000) };
  })
  .handler(async ({ data }): Promise<AgentResult> => {
    const { agentType, input } = data;
    const meta = getAgentMeta(agentType);
    const focus = input.trim() || "the target market";

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      // No key configured — fall back to the simulated runner.
      return runSimulatedAgent(agentType, input) as unknown as AgentResult;
    }

    try {
      const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
      const gateway = createLovableAiGatewayProvider(apiKey);
      const model = gateway("google/gemini-3-flash-preview");

      const system = [
        `You are "${meta.name}", a specialized innovation-intelligence AI agent for the HUBFLOW platform.`,
        `Your job: ${meta.description}`,
        `Task focus: ${AGENT_GOALS[agentType]}`,
        "",
        "Respond with ONLY a JSON object (no markdown, no prose) with this exact shape:",
        `{
  "summary": "1-3 sentence executive summary",
  "blocks": [
    { "heading": "string", "kind": "tags", "tags": ["string"] },
    { "heading": "string", "kind": "paragraph", "paragraph": "string" },
    { "heading": "string", "kind": "score", "score": { "value": 0, "label": "string" } },
    { "heading": "string", "kind": "list", "list": [ { "label": "string", "detail": "string", "badge": "string", "tone": "low|medium|high|neutral" } ] },
    { "heading": "string", "kind": "cards", "cards": [ { "title": "string", "fields": [ { "label": "string", "value": "string" } ] } ] }
  ]
}`,
        "Only include the block fields relevant to each block's kind. Use 2-4 blocks.",
        "Write all content in the same language as the user's input.",
        "Base the analysis on realistic, plausible market knowledge — be specific and useful, not generic filler.",
      ].join("\n");

      const { text } = await generateText({
        model,
        system,
        prompt: `Analyze the following for the user: "${focus}".`,
        temperature: 0.7,
      });

      const parsed = extractJson(text) as { summary?: unknown; blocks?: unknown };
      const blocks = normalizeBlocks(parsed.blocks);
      if (blocks.length === 0) throw new Error("Model returned no usable blocks");

      return {
        summary: String(parsed.summary ?? `Analysis for "${focus}".`),
        blocks,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Surface billing / rate-limit issues so the UI can show a clear message.
      if (message.includes("429")) throw new Error("RATE_LIMIT");
      if (message.includes("402")) throw new Error("CREDITS_EXHAUSTED");
      // Otherwise gracefully fall back to the simulated runner.
      console.error("[runAgentFn] falling back to simulated agent:", message);
      return runSimulatedAgent(agentType, input) as unknown as AgentResult;
    }
  });