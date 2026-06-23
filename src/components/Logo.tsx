import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  subtitle = "Innovation",
  className,
  iconClassName,
}: {
  subtitle?: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-primary-foreground shadow-soft",
          iconClassName,
        )}
      >
        <Lightbulb className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-tight">HUBFLOW</span>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {subtitle}
        </span>
      </span>
    </div>
  );
}