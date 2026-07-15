import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightElement, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-neutral-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3.5 text-neutral-500 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full rounded-xl border bg-white/[0.04] text-white placeholder:text-neutral-600",
              "py-3 text-sm transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:border-transparent",
              error
                ? "border-red-500/50 focus:ring-red-500/40"
                : "border-white/10 focus:ring-purple-500/40",
              icon ? "pl-10 pr-4" : "px-4",
              rightElement ? "pr-12" : "",
              className
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3.5">{rightElement}</span>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
