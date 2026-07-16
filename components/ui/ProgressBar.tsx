import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
  color?: "primary" | "emerald" | "cyan";
}

export function ProgressBar({
  value,
  className,
  showLabel = false,
  size = "md",
  color = "primary",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const heights = { sm: "h-1", md: "h-2" };
  const colors = {
    primary: "from-primary-start to-primary-end",
    emerald: "from-emerald-accent to-emerald-400",
    cyan: "from-cyan-accent to-sky-400",
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        className={cn("w-full rounded-full bg-white/10 overflow-hidden", heights[size])}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-300 ease-out",
            colors[color]
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-neutral-500 tabular-nums">{clamped.toFixed(0)}%</span>
      )}
    </div>
  );
}
