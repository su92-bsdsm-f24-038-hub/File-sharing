"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      // Blob 1: Top Right Orange
      gsap.to(blob1Ref.current, {
        x: () => gsap.utils.random(-200, 200),
        y: () => gsap.utils.random(-200, 200),
        rotation: 360,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Blob 2: Bottom Left Glow Orange
      gsap.to(blob2Ref.current, {
        x: () => gsap.utils.random(-300, 300),
        y: () => gsap.utils.random(-200, 200),
        scale: () => gsap.utils.random(0.8, 1.3),
        duration: 25,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Blob 3: Center subtle blue
      gsap.to(blob3Ref.current, {
        x: () => gsap.utils.random(-150, 150),
        y: () => gsap.utils.random(-150, 150),
        duration: 30,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none -z-50 overflow-hidden"
      style={{ background: "#09090B" }}
    >
      <div
        ref={blob1Ref}
        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.12] mix-blend-screen"
        style={{ background: "#FF7A1A" }}
      />
      <div
        ref={blob2Ref}
        className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] opacity-[0.1] mix-blend-screen"
        style={{ background: "#FF9A3D" }}
      />
      <div
        ref={blob3Ref}
        className="absolute top-[30%] left-[40%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.05] mix-blend-screen"
        style={{ background: "#3B82F6" }}
      />
      
      {/* Noise Overlay for texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}
