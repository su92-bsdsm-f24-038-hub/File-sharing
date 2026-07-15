import { cn } from "@/lib/utils";
import { CSSProperties, ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  style?: CSSProperties;
}

export function GlassCard({
  children,
  className,
  hover = false,
  glow = false,
  style,
}: GlassCardProps) {
  return (
    <div
      style={style}
      className={cn(
        "relative rounded-3xl border border-purple-500/10 bg-white/[0.03] backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(124,58,237,0.05),0_4px_24px_rgba(0,0,0,0.4)]",
        hover &&
          "transition-all duration-300 hover:border-purple-500/25 hover:bg-white/[0.06] hover:shadow-[0_0_0_1px_rgba(124,58,237,0.15),0_8px_40px_rgba(0,0,0,0.5)]",
        glow &&
          "shadow-[0_0_0_1px_rgba(124,58,237,0.2),0_4px_24px_rgba(124,58,237,0.15),0_0_60px_rgba(124,58,237,0.05)]",
        className
      )}
    >
      {children}
    </div>
  );
}
