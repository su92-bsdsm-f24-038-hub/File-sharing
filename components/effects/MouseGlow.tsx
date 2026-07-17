"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function MouseGlow() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Use springs for smooth following
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] mix-blend-screen z-[-10]"
      style={{
        x: mouseX,
        y: mouseY,
        translateX: "-50%",
        translateY: "-50%",
        background: "radial-gradient(circle, rgba(255,122,26,0.15) 0%, rgba(255,122,26,0) 70%)",
        opacity: isVisible ? 1 : 0,
      }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    />
  );
}
