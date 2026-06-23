// =============================================================================
// HUBFLOW AI Agents service (SIMULATED)
//
// Each function below simulates an AI/LLM response with a structured object
// derived from the user's input. Today it returns mocked, plausible content so
// the UI is fully functional.
//
// 🔌 FUTURE INTEGRATION POINT:
// Replace the body of each `run*` function with a real call to an LLM (e.g.
// the Lovable AI Gateway) and/or a market-scraping service. Keep the returned
// `AgentResult` shape identical so the UI keeps working without changes.
// =============================================================================

import type { AgentType } from "./types";

export type BlockKind = "tags" | "list" | "cards" | "score" | "paragraph";

export interface AgentResultBlock {
  heading: string;
  kind: BlockKind;
  // tags: string[] | list: ListItem[] | cards: CardItem[] | score: ScoreItem | paragraph: string
  data: unknown;
}

export interface ListItem {
  label: string;
  detail?: string;
  badge?: string;
  tone?: "low" | "medium" | "high" | "neutral";
}

export interface CardItem {
  title: string;
  fields: { label: string; value: string }[];
}

export interface ScoreItem {
  value: number;
  label: string;
}

export interface AgentResult {
  summary: string;
  blocks: AgentResultBlock[];
}

export interface AgentMeta {
  type: AgentType;
  name: string;
  description: string;
  icon: string; // lucide icon name
  inputLabel: string;
  inputPlaceholder: string;
}

export const AGENTS: AgentMeta[] = [
  {
    type: "MarketScout",
    name: "Market Scout Agent",
    description: "Collects pricing and market data so you can position before you build.",
    icon: "Search",
    inputLabel: "Market / segment / product",
    inputPlaceholder: "e.g. SaaS CRM subscription pricing in Brazil",
  },
  {
    type: "IdeaRadar",
    name: "Idea Radar Agent",
    description: "Compares your idea against existing ones and surfaces white spaces.",
    icon: "Radar",
    inputLabel: "Your idea in one line",
    inputPlaceholder: "e.g. AI assistant for small clinic scheduling",
  },
  {
    type: "OpportunityMapper",
    name: "Opportunity Mapper Agent",
    description: "Maps innovation opportunities by sector, region and maturity.",
    icon: "Map",
    inputLabel: "Sector / region",
    inputPlaceholder: "e.g. Healthtech in Latin America",
  },
  {
    type: "ThreatRisk",
    name: "Threat & Risk Agent",
    description: "Identifies threats and risks across market, tech and regulation.",
    icon: "ShieldAlert",
    inputLabel: "Context to assess",
    inputPlaceholder: "e.g. Launching an open-banking lending product",
  },
  {
    type: "WhyNotInnovate",
    name: "Why Not Innovate? Agent",
    description: "Lists cultural, financial, technological and regulatory barriers.",
    icon: "HelpCircle",
    inputLabel: "Innovation context",
    inputPlaceholder: "e.g. Digital transformation in a 30-year-old retailer",
  },
  {
    type: "TrendsBenchmark",
    name: "Trends & Benchmark Agent",
    description: "Analyzes emerging trends, competitors and business models.",
    icon: "TrendingUp",
    inputLabel: "Market to benchmark",
    inputPlaceholder: "e.g. B2B fintech payments",
  },
  {
    type: "ConsumerInsight",
    name: "Consumer Insight Agent",
    description: "Brings consumer behavior insights and partnership opportunities.",
    icon: "Users",
    inputLabel: "Audience / segment",
    inputPlaceholder: "e.g. Gen Z investors in Brazil",
  },
  {
    type: "ImpactSustainability",
    name: "Impact & Sustainability Agent",
    description: "Evaluates social and environmental impact and ESG considerations.",
    icon: "Leaf",
    inputLabel: "Innovation to evaluate",
    inputPlaceholder: "e.g. Reusable packaging marketplace",
  },
];

export function getAgentMeta(type: AgentType): AgentMeta {
  return AGENTS.find((a) => a.type === type) ?? AGENTS[0];
}

// --- helpers -----------------------------------------------------------------
const focus = (input: string) => (input.trim() ? input.trim() : "your target market");
const seedFrom = (s: string) => s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

// --- agents ------------------------------------------------------------------

function runMarketScout(input: string): AgentResult {
  const f = focus(input);
  return {
    summary: `Market scan for "${f}" shows a fragmented landscape with room in the mid-price tier. Average pricing clusters around premium and low-cost extremes, leaving a mainstream gap.`,
    blocks: [
      {
        heading: "Sampled products & pricing",
        kind: "cards",
        data: [
          { title: "Entry / Low-cost", fields: [{ label: "Range", value: "$9 – $29 / mo" }, { label: "Positioning", value: "Low-cost" }, { label: "Sample vendors", value: "StarterCo, LeanTools" }] },
          { title: "Mainstream", fields: [{ label: "Range", value: "$39 – $99 / mo" }, { label: "Positioning", value: "Mainstream" }, { label: "Sample vendors", value: "FlowSuite, CoreApp" }] },
          { title: "Premium", fields: [{ label: "Range", value: "$149 – $399 / mo" }, { label: "Positioning", value: "Premium" }, { label: "Sample vendors", value: "EnterpriseX, ProGrade" }] },
        ] as CardItem[],
      },
      {
        heading: "Summary",
        kind: "list",
        data: [
          { label: "Average price", detail: "≈ $84 / month", tone: "neutral" },
          { label: "Positioning", detail: "Polarized between premium and low-cost", tone: "medium" },
          { label: "Opportunity", detail: "Intermediate price tier is under-served", tone: "high" },
        ] as ListItem[],
      },
    ],
  };
}

function runIdeaRadar(input: string): AgentResult {
  const f = focus(input);
  const novelty = 50 + (seedFrom(f) % 45);
  return {
    summary: `"${f}" partially overlaps with existing solutions but holds clear white spaces. Novelty score: ${novelty}/100.`,
    blocks: [
      { heading: "Novelty score", kind: "score", data: { value: novelty, label: "How new this idea looks" } as ScoreItem },
      {
        heading: "Similar existing ideas",
        kind: "list",
        data: [
          { label: "Established generalist platform", detail: "Broad feature set, weak vertical focus", badge: "High similarity", tone: "high" },
          { label: "Regional niche player", detail: "Strong locally, limited automation", badge: "Medium similarity", tone: "medium" },
          { label: "Adjacent workflow tool", detail: "Different core but overlapping users", badge: "Low similarity", tone: "low" },
        ] as ListItem[],
      },
      {
        heading: "White spaces",
        kind: "tags",
        data: ["AI-native workflows", "Vertical specialization", "Self-serve onboarding", "Transparent pricing", "Embedded analytics"],
      },
    ],
  };
}

function runOpportunityMapper(input: string): AgentResult {
  const f = focus(input);
  return {
    summary: `Opportunity map for "${f}" highlights three high-impact innovations driven by automation and shifting customer expectations.`,
    blocks: [
      { heading: "Macro trends", kind: "tags", data: ["AI automation", "Embedded finance", "Hyper-personalization", "Sustainability", "Remote-first"] },
      { heading: "Market gaps", kind: "tags", data: ["Underserved SMB segment", "Poor mobile experience", "Manual back-office", "Lack of integrations"] },
      {
        heading: "Potential innovations",
        kind: "cards",
        data: [
          { title: "AI-assisted workflows", fields: [{ label: "Impact", value: "High" }, { label: "Complexity", value: "Medium" }, { label: "Horizon", value: "Short term" }] },
          { title: "Vertical marketplace", fields: [{ label: "Impact", value: "Medium" }, { label: "Complexity", value: "High" }, { label: "Horizon", value: "Mid term" }] },
          { title: "Outcome-based pricing", fields: [{ label: "Impact", value: "High" }, { label: "Complexity", value: "Medium" }, { label: "Horizon", value: "Mid term" }] },
        ] as CardItem[],
      },
    ],
  };
}

function runThreatRisk(input: string): AgentResult {
  const f = focus(input);
  return {
    summary: `Risk assessment for "${f}" surfaces moderate-to-high exposure in regulation and competition. Mitigation paths are available.`,
    blocks: [
      {
        heading: "Market threats",
        kind: "list",
        data: [{ label: "Demand volatility", detail: "Mitigation: validate with pilots before scaling", badge: "P: Medium / I: High", tone: "high" }] as ListItem[],
      },
      {
        heading: "Technology threats",
        kind: "list",
        data: [{ label: "Fast-moving AI stack", detail: "Mitigation: modular architecture, avoid lock-in", badge: "P: High / I: Medium", tone: "medium" }] as ListItem[],
      },
      {
        heading: "Regulatory threats",
        kind: "list",
        data: [{ label: "Data & privacy compliance", detail: "Mitigation: privacy-by-design, legal review", badge: "P: Medium / I: High", tone: "high" }] as ListItem[],
      },
      {
        heading: "Competitive threats",
        kind: "list",
        data: [{ label: "Incumbents copying features", detail: "Mitigation: build a defensible data moat", badge: "P: High / I: Medium", tone: "medium" }] as ListItem[],
      },
    ],
  };
}

function runWhyNotInnovate(input: string): AgentResult {
  const f = focus(input);
  return {
    summary: `Why not innovate in "${f}"? The main blockers are cultural inertia and unclear ROI — but each is addressable, and the cost of inaction is losing relevance.`,
    blocks: [
      { heading: "Cultural barriers", kind: "list", data: [{ label: "Fear of failure", detail: "Overcome: celebrate learning, run safe-to-fail experiments", tone: "high" }] as ListItem[] },
      { heading: "Financial barriers", kind: "list", data: [{ label: "Unclear ROI / budget pressure", detail: "Overcome: stage-gate funding, small bets first", tone: "medium" }] as ListItem[] },
      { heading: "Technological barriers", kind: "list", data: [{ label: "Legacy systems & skill gaps", detail: "Overcome: APIs, partnerships, targeted upskilling", tone: "medium" }] as ListItem[] },
      { heading: "Regulatory barriers", kind: "list", data: [{ label: "Compliance uncertainty", detail: "Overcome: sandbox pilots, early regulator dialogue", tone: "low" }] as ListItem[] },
      {
        heading: "So… why innovate anyway?",
        kind: "paragraph",
        data: `Standing still is the real risk. Competitors are already experimenting, customer expectations keep rising, and the window to lead "${f}" is open now. Start with one low-cost, high-learning experiment this quarter — the barriers shrink the moment you move.`,
      },
    ],
  };
}

function runTrendsBenchmark(input: string): AgentResult {
  const f = focus(input);
  return {
    summary: `Trends & benchmark for "${f}": global momentum toward AI-native, usage-based models. Three competitor archetypes worth tracking.`,
    blocks: [
      { heading: "Global trends", kind: "tags", data: ["AI-native UX", "Usage-based pricing", "Composability / APIs", "Vertical SaaS"] },
      { heading: "Local trends", kind: "tags", data: ["Mobile-first adoption", "Pix / instant payments", "Local-language AI", "SMB digitalization"] },
      {
        heading: "Benchmark competitors",
        kind: "cards",
        data: [
          { title: "Leader", fields: [{ label: "Type", value: "Leader" }, { label: "Innovation strategy", value: "Platform + ecosystem lock-in" }] },
          { title: "Challenger", fields: [{ label: "Type", value: "Challenger" }, { label: "Innovation strategy", value: "Aggressive AI features & pricing" }] },
          { title: "Niche", fields: [{ label: "Type", value: "Niche" }, { label: "Innovation strategy", value: "Deep vertical specialization" }] },
        ] as CardItem[],
      },
      {
        heading: "Business model suggestions",
        kind: "list",
        data: [
          { label: "Subscription", detail: "Pro: predictable revenue · Con: harder initial adoption", tone: "neutral" },
          { label: "Pay-per-use", detail: "Pro: low entry barrier · Con: revenue variability", tone: "neutral" },
          { label: "Platform / marketplace", detail: "Pro: network effects · Con: chicken-and-egg start", tone: "neutral" },
        ] as ListItem[],
      },
    ],
  };
}

function runConsumerInsight(input: string): AgentResult {
  const f = focus(input);
  return {
    summary: `Consumer insight for "${f}": users want speed, transparency and personalization — and reward brands that reduce friction.`,
    blocks: [
      { heading: "Consumer behaviors", kind: "tags", data: ["Self-serve first", "Mobile by default", "Values transparency", "Expects instant support"] },
      { heading: "Pain points", kind: "tags", data: ["Complex onboarding", "Hidden fees", "Slow support", "Fragmented tools"] },
      {
        heading: "Segments / personas",
        kind: "cards",
        data: [
          { title: "Pragmatic Operator", fields: [{ label: "Driver", value: "Efficiency & ROI" }, { label: "Channel", value: "Word of mouth" }] },
          { title: "Early Adopter", fields: [{ label: "Driver", value: "Novelty & edge" }, { label: "Channel", value: "Communities & social" }] },
        ] as CardItem[],
      },
      { heading: "Partnership opportunities", kind: "tags", data: ["Startups", "Universities", "Suppliers", "Platforms & integrators"] },
    ],
  };
}

function runImpactSustainability(input: string): AgentResult {
  const f = focus(input);
  return {
    summary: `Impact & sustainability for "${f}": meaningful upside on access and efficiency, with manageable environmental footprint and strong ESG storytelling potential.`,
    blocks: [
      { heading: "Social impacts", kind: "list", data: [{ label: "Positive: broader access & inclusion", tone: "high" }, { label: "Negative: potential job displacement", tone: "medium" }] as ListItem[] },
      { heading: "Environmental impacts", kind: "list", data: [{ label: "Positive: less waste via digitalization", tone: "high" }, { label: "Negative: compute / energy footprint", tone: "medium" }] as ListItem[] },
      { heading: "ESG considerations", kind: "tags", data: ["Governance & transparency", "Data ethics", "Responsible AI", "Supply-chain accountability"] },
      { heading: "Sustainability opportunities", kind: "tags", data: ["Carbon-aware operations", "Circular models", "Impact reporting", "Inclusive design"] },
    ],
  };
}

const RUNNERS: Record<AgentType, (input: string) => AgentResult> = {
  MarketScout: runMarketScout,
  IdeaRadar: runIdeaRadar,
  OpportunityMapper: runOpportunityMapper,
  ThreatRisk: runThreatRisk,
  WhyNotInnovate: runWhyNotInnovate,
  TrendsBenchmark: runTrendsBenchmark,
  ConsumerInsight: runConsumerInsight,
  ImpactSustainability: runImpactSustainability,
};

// Simulate latency so the UI shows a realistic "thinking" state.
export async function runAgent(type: AgentType, input: string): Promise<AgentResult> {
  await new Promise((r) => setTimeout(r, 700 + (seedFrom(input) % 600)));
  return RUNNERS[type](input);
}