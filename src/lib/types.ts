// HUBFLOW domain types

export type ProjectStatus = "InProgress" | "Approved" | "Archived";
export type Maturity = "Ideation" | "Validation" | "MVP" | "Scale";
export type IdeaType =
  | "Incremental"
  | "Disruptive"
  | "Process"
  | "Product"
  | "Service"
  | "BusinessModel";
export type IdeaStatus = "Draft" | "InReview" | "Approved" | "Rejected" | "Archived";

export type AgentType =
  | "MarketScout"
  | "IdeaRadar"
  | "OpportunityMapper"
  | "ThreatRisk"
  | "WhyNotInnovate"
  | "TrendsBenchmark"
  | "ConsumerInsight"
  | "ImpactSustainability";

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  sector: string;
  maturity: Maturity;
  status: ProjectStatus;
  owner: string;
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  type: IdeaType;
  status: IdeaStatus;
  projectId: string | null;
  author: string;
  sector: string;
  tags: string[];
  createdAt: string;
}

export interface Insight {
  id: string;
  ideaId: string | null;
  projectId: string | null;
  agentType: AgentType;
  inputContext: Record<string, unknown>;
  resultSummary: string;
  resultStructured: Record<string, unknown>;
  createdAt: string;
}