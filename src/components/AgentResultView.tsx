import { cn } from "@/lib/utils";
import { Pill } from "@/components/Badges";
import type {
  AgentResult,
  AgentResultBlock,
  CardItem,
  ListItem,
  ScoreItem,
} from "@/lib/ai-agents";

const toneMap = {
  high: "red",
  medium: "amber",
  low: "green",
  neutral: "gray",
} as const;

function BlockView({ block }: { block: AgentResultBlock }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {block.heading}
      </h4>
      {block.kind === "paragraph" && (
        <p className="rounded-xl bg-accent/60 p-4 text-sm leading-relaxed text-foreground">
          {block.data as string}
        </p>
      )}
      {block.kind === "tags" && (
        <div className="flex flex-wrap gap-2">
          {(block.data as string[]).map((t) => (
            <Pill key={t} tone="blue">
              {t}
            </Pill>
          ))}
        </div>
      )}
      {block.kind === "score" && (
        <ScoreView score={block.data as ScoreItem} />
      )}
      {block.kind === "list" && (
        <ul className="space-y-2">
          {(block.data as ListItem[]).map((item, idx) => (
            <li
              key={idx}
              className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border bg-card p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                {item.detail && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.detail}</p>
                )}
              </div>
              {item.badge && <Pill tone={toneMap[item.tone ?? "neutral"]}>{item.badge}</Pill>}
              {!item.badge && item.tone && (
                <Pill tone={toneMap[item.tone]}>{item.tone}</Pill>
              )}
            </li>
          ))}
        </ul>
      )}
      {block.kind === "cards" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(block.data as CardItem[]).map((card, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-bold">{card.title}</p>
              <dl className="mt-2 space-y-1.5">
                {card.fields.map((f) => (
                  <div key={f.label} className="text-sm">
                    <dt className="text-xs text-muted-foreground">{f.label}</dt>
                    <dd className="font-medium">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreView({ score }: { score: ScoreItem }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-end gap-3">
        <span className="text-4xl font-extrabold text-gradient">{score.value}</span>
        <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{score.label}</p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full brand-gradient"
          style={{ width: `${Math.min(100, Math.max(0, score.value))}%` }}
        />
      </div>
    </div>
  );
}

export function AgentResultView({
  result,
  className,
}: {
  result: AgentResult;
  className?: string;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      <p className="rounded-xl border border-border bg-secondary/60 p-4 text-sm leading-relaxed">
        {result.summary}
      </p>
      {result.blocks.map((block, idx) => (
        <BlockView key={idx} block={block} />
      ))}
    </div>
  );
}