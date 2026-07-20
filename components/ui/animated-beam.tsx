import React, { useEffect, useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-neutral-900 border-neutral-800 p-3 shadow-lg", className)}
      >
        {children}
      </div>
    );
  }
);
Circle.displayName = "Circle";

export const AnimatedBeam = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  dotted = false,
}: any) => {
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });

        const startX = rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY = rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX = rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY = rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        // Simple bezier curve calculation
        const controlY = startY - curvature;
        const d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`;
        setPathD(d);
      }
    };
    updatePath();
    const resizeObserver = new ResizeObserver(updatePath);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  return (
    <svg fill="none" width={svgDimensions.width} height={svgDimensions.height} className={cn("pointer-events-none absolute left-0 top-0", className)}>
      <path d={pathD} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" strokeDasharray={dotted ? "4 4" : "none"} />
      <path d={pathD} stroke={`url(#gradient-${gradientStartColor})`} strokeWidth={pathWidth} strokeLinecap="round" strokeDasharray={dotted ? "4 4" : "none"} className="animate-beam-draw" />
      <defs>
        <linearGradient id={`gradient-${gradientStartColor}`} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={gradientStartColor} />
          <stop offset="100%" stopColor={gradientStopColor} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const Icons = {
  typescript: () => <span className="text-blue-500 font-bold text-xs">TS</span>,
  tailwindcss: () => <span className="text-cyan-400 font-bold text-xs">TW</span>,
  framer: () => <span className="text-white font-bold text-xs">FM</span>,
  logo: () => <span className="text-primary-orange font-bold text-xl">S</span>,
  gsap: () => <span className="text-green-500 font-bold text-xs">GS</span>,
  nextjs: () => <span className="text-white font-bold text-xs">NX</span>,
  reactjs: () => <span className="text-cyan-500 font-bold text-xs">RE</span>,
};
