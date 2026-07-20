import React from "react";

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    style={{ filter: "drop-shadow(0px 0px 10px rgba(255, 122, 26, 0.6))" }}
  >
    <path 
      d="M28,68 C12,68 12,32 28,32 C45,32 55,68 72,68 C88,68 88,32 72,32" 
      stroke="#FF7A1A" 
      strokeWidth="10" 
      strokeLinecap="round" 
    />
    <circle cx="28" cy="68" r="9" fill="#FF7A1A" />
    <circle cx="72" cy="32" r="9" fill="#FF7A1A" />
  </svg>
);
