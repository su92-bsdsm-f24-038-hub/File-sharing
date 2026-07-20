import { cn } from "@/lib/utils";
import React from "react";

export function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  reverse?: boolean;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !className?.includes("vertical"),
          "flex-col": className?.includes("vertical"),
        },
        className
      )}
    >
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0 justify-around [gap:var(--gap)] min-w-full",
            {
              "animate-marquee flex-row": !className?.includes("vertical"),
              "animate-marquee-vertical flex-col": className?.includes("vertical"),
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            }
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
