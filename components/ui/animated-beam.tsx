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
  typescript: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2H22V22H2V2Z" fill="#3178C6"/>
      <path d="M12.9814 11.2332C12.9814 11.2332 14.1812 10.2334 15.6811 10.2334C17.1809 10.2334 18.1808 11.2332 18.1808 12.733C18.1808 14.2329 16.981 15.2327 15.4812 15.2327C14.7313 15.2327 13.9814 14.7328 13.4815 14.2329L14.4813 12.9831C14.7313 13.483 15.2312 13.7329 15.7311 13.7329C16.481 13.7329 16.7309 13.233 16.7309 12.733C16.7309 12.2331 16.481 11.7332 15.7311 11.7332C14.2313 11.7332 12.9814 12.733 12.9814 14.2329C12.9814 15.7327 14.2313 17.2325 15.981 17.2325C17.7307 17.2325 19.2305 16.2326 19.9803 14.7329L18.4806 13.983C17.9807 15.2328 16.7309 15.7327 15.981 15.7327C14.9812 15.7327 14.4813 14.9829 14.4813 14.2329C14.4813 13.483 14.9812 12.9831 15.981 12.9831C16.9808 12.9831 17.4807 13.483 17.9807 14.2329L19.4804 13.2331C18.7305 11.7332 17.4807 10.9833 15.981 10.9833C14.2313 10.9833 12.9814 11.9832 12.9814 13.4829V11.2332Z" fill="white"/>
      <path d="M6.23242 10.4833H11.2316V11.983H9.48187V17.2322H7.98211V11.983H6.23242V10.4833Z" fill="white"/>
    </svg>
  ),
  tailwindcss: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.001 5.4C9.60105 5.4 7.80112 6.6 6.6012 9C7.80112 7.8 9.00105 7.5 10.201 7.8C10.957 7.988 11.4965 8.5395 12.0954 9.15171C13.2201 10.3015 14.4756 11.5846 18.001 11.5846C20.401 11.5846 22.201 10.3846 23.4009 7.98462C22.201 9.18462 21.001 9.48462 19.801 9.18462C19.045 8.99662 18.5054 8.44512 17.9066 7.8329C16.7819 6.68316 15.5263 5.4 12.001 5.4ZM6.0012 11.5846C3.60127 11.5846 1.80135 12.7846 0.601425 15.1846C1.80135 13.9846 3.00127 13.6846 4.2012 13.9846C4.95719 14.1726 5.49673 14.7241 6.09559 15.3363C7.22031 16.4861 8.47582 17.7692 12.001 17.7692C14.401 17.7692 16.2009 16.5692 17.4008 14.1692C16.2009 15.3692 15.001 15.0692 13.801 14.7692C13.045 14.5812 12.5055 14.0297 11.9066 13.4175C10.7819 12.2678 9.5264 10.9846 6.0012 11.5846Z" fill="#38BDF8"/>
    </svg>
  ),
  framer: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12L4 4H20L12 12Z" fill="white"/>
      <path d="M12 12L4 20V12H12Z" fill="white"/>
      <path d="M12 12H20V20L12 12Z" fill="white"/>
    </svg>
  ),
  logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FF7A1A"/>
    </svg>
  ),
  gsap: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#88CE02"/>
      <path d="M15 10L11 14L9 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  nextjs: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="white" stroke="white" strokeWidth="2"/>
      <path d="M15 15L9 9V15L15 9" stroke="black" strokeWidth="1.5" strokeLinecap="square"/>
    </svg>
  ),
  reactjs: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="2" fill="#61DAFB"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" fill="none" transform="rotate(30 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" fill="none" transform="rotate(90 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" fill="none" transform="rotate(150 12 12)"/>
    </svg>
  ),
};
