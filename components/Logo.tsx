import React from "react";
import Image from "next/image";

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <Image 
      src="/logo.png" 
      alt="Sync Logo" 
      fill 
      className="object-contain" 
      priority
    />
  </div>
);
