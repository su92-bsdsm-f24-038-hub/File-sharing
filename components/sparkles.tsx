"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const Sparkles = ({
  density = 50,
  speed = 1,
  size = 1.2,
  direction = "top",
  opacitySpeed = 2,
  color = "#FFFFFF",
  className,
}: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: any[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < density; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * size,
          vx: (Math.random() - 0.5) * speed,
          vy: direction === "top" ? -Math.random() * speed : (Math.random() - 0.5) * speed,
          opacity: Math.random(),
          opacitySpeed: (Math.random() * 0.02 + 0.005) * opacitySpeed,
          fade: Math.random() > 0.5 ? 1 : -1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      
      particles.forEach((p) => {
        p.opacity += p.opacitySpeed * p.fade;
        if (p.opacity >= 1) {
          p.opacity = 1;
          p.fade = -1;
        } else if (p.opacity <= 0.1) {
          p.opacity = 0.1;
          p.fade = 1;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (direction === "top") {
          if (p.y < 0) {
            p.y = canvas.height;
            p.x = Math.random() * canvas.width;
          }
        } else {
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        }

        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, speed, size, direction, opacitySpeed, color]);

  return <canvas ref={canvasRef} className={cn("w-full h-full block", className)} />;
};
