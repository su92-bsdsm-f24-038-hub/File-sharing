"use client";

import { cn } from "@/lib/utils";
import { CSSProperties, ReactNode, forwardRef, MouseEvent, useState } from "react";
import { motion, HTMLMotionProps, useSpring, useTransform, useMotionValue } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glowColor?: "primary" | "cyan" | "emerald";
  style?: CSSProperties;
  tilt?: boolean; // new tilt prop
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, hover = false, glow = false, glowColor = "primary", tilt = true, style, ...props }, ref) => {
    
    // Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
      if (!tilt) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;
      x.set(xPct);
      y.set(yPct);
    };

    const handleMouseLeave = () => {
      if (!tilt) return;
      x.set(0);
      y.set(0);
    };

    // Base styles
    let baseStyles = "relative rounded-[24px] border border-white/5 bg-[#15171D]/80 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.4)] overflow-hidden ";
    
    if (glow) {
      if (glowColor === "primary") baseStyles += " halo-glow";
      if (glowColor === "cyan") baseStyles += " halo-glow-cyan";
    }

    if (glowColor === "primary") {
      baseStyles += "border-primary-orange/20 ";
      if (hover) {
        baseStyles += "hover:border-primary-orange/50 hover:bg-[#15171D]/90 hover:shadow-[0_0_0_1px_rgba(255,122,26,0.3),0_8px_40px_rgba(255,122,26,0.2)] ";
      }
    } else if (glowColor === "cyan") {
      baseStyles += "border-cyan-accent/20 ";
      if (hover) {
        baseStyles += "hover:border-cyan-accent/40 hover:bg-[#15171D]/90 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_8px_40px_rgba(59,130,246,0.2)] ";
      }
    } else if (glowColor === "emerald") {
      baseStyles += "border-emerald-accent/20 ";
      if (glow) {
        baseStyles += "shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_4px_24px_rgba(16,185,129,0.15),0_0_60px_rgba(16,185,129,0.05)] ";
      }
      if (hover) {
        baseStyles += "hover:border-emerald-accent/40 hover:bg-[#15171D]/90 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_8px_40px_rgba(16,185,129,0.2)] ";
      }
    }

    return (
      <motion.div
        ref={ref}
        style={{
          ...style,
          rotateX: tilt ? rotateX : 0,
          rotateY: tilt ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(baseStyles, "transition-colors duration-300", className)}
        whileHover={hover ? { y: -6, scale: 1.02 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
