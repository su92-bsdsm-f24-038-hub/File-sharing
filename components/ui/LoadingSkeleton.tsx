import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 1 }: LoadingSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-xl bg-white/[0.05] animate-pulse",
            i === 0 ? "h-6 w-3/4" : i === lines - 1 ? "h-4 w-1/2" : "h-4 w-full"
          )}
        />
      ))}
    </div>
  );
}

export function QRSkeleton() {
  return (
    <div className="w-48 h-48 rounded-2xl bg-white/[0.04] animate-pulse flex items-center justify-center border border-purple-500/10">
      <div className="w-8 h-8 rounded-lg bg-purple-500/20 animate-pulse" />
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {[0.8, 0.6, 0.9, 0.5].map((w, i) => (
        <div
          key={i}
          className={cn(
            "h-10 rounded-2xl bg-white/[0.04] animate-pulse",
            i % 2 === 0 ? "self-start" : "self-end"
          )}
          style={{ width: `${w * 100}%` }}
        />
      ))}
    </div>
  );
}
