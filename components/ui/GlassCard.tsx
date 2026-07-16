import { cn } from "@/lib/utils";
import { CSSProperties, ReactNode, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glowColor?: "primary" | "cyan" | "emerald";
  style?: CSSProperties;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, hover = false, glow = false, glowColor = "primary", style, ...props }, ref) => {
    
    // Base styles
    let baseStyles = "relative rounded-3xl border bg-white/[0.03] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] ";
    
    if (glowColor === "primary") {
      baseStyles += "border-primary-start/10 ";
      if (glow) {
        baseStyles += "shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_4px_24px_rgba(59,130,246,0.15),0_0_60px_rgba(59,130,246,0.05)] ";
      }
      if (hover) {
        baseStyles += "hover:border-primary-start/30 hover:bg-white/[0.06] hover:shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_8px_40px_rgba(59,130,246,0.2)] ";
      }
    } else if (glowColor === "cyan") {
      baseStyles += "border-cyan-accent/10 ";
      if (glow) {
        baseStyles += "shadow-[0_0_0_1px_rgba(6,182,212,0.2),0_4px_24px_rgba(6,182,212,0.15),0_0_60px_rgba(6,182,212,0.05)] ";
      }
      if (hover) {
        baseStyles += "hover:border-cyan-accent/30 hover:bg-white/[0.06] hover:shadow-[0_0_0_1px_rgba(6,182,212,0.3),0_8px_40px_rgba(6,182,212,0.2)] ";
      }
    } else if (glowColor === "emerald") {
      baseStyles += "border-emerald-accent/10 ";
      if (glow) {
        baseStyles += "shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_4px_24px_rgba(16,185,129,0.15),0_0_60px_rgba(16,185,129,0.05)] ";
      }
      if (hover) {
        baseStyles += "hover:border-emerald-accent/30 hover:bg-white/[0.06] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_8px_40px_rgba(16,185,129,0.2)] ";
      }
    }

    return (
      <motion.div
        ref={ref}
        style={style}
        className={cn(baseStyles, "transition-colors duration-300", className)}
        whileHover={hover ? { y: -4, scale: 1.02 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
