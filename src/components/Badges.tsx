import { cn } from "@/lib/utils";
import type {
  IdeaStatus,
  IdeaType,
  Maturity,
  ProjectStatus,
} from "@/lib/types";

const base =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap";

const tones = {
  blue: "bg-accent text-accent-foreground",
  green: "bg-success/15 text-success",
  amber: "bg-warning/20 text-warning-foreground",
  red: "bg-destructive/12 text-destructive",
  gray: "bg-muted text-muted-foreground",
  violet: "bg-chart-4/15 text-chart-4",
} as const;

type Tone = keyof typeof tones;

export function Pill({
  children,
  tone = "gray",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={cn(base, tones[tone], className)}>{children}</span>;
}

const projectStatusTone: Record<ProjectStatus, Tone> = {
  InProgress: "blue",
  Approved: "green",
  Archived: "gray",
};
const projectStatusLabel: Record<ProjectStatus, string> = {
  InProgress: "In Progress",
  Approved: "Approved",
  Archived: "Archived",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Pill tone={projectStatusTone[status]}>{projectStatusLabel[status]}</Pill>;
}

const ideaStatusTone: Record<IdeaStatus, Tone> = {
  Draft: "gray",
  InReview: "amber",
  Approved: "green",
  Rejected: "red",
  Archived: "gray",
};
const ideaStatusLabel: Record<IdeaStatus, string> = {
  Draft: "Draft",
  InReview: "In Review",
  Approved: "Approved",
  Rejected: "Rejected",
  Archived: "Archived",
};

export function IdeaStatusBadge({ status }: { status: IdeaStatus }) {
  return <Pill tone={ideaStatusTone[status]}>{ideaStatusLabel[status]}</Pill>;
}

export function IdeaTypeBadge({ type }: { type: IdeaType }) {
  return <Pill tone="violet">{type}</Pill>;
}

export function MaturityBadge({ maturity }: { maturity: Maturity }) {
  return <Pill tone="blue">{maturity}</Pill>;
}