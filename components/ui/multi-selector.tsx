import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MultiSelect({
  options,
  onValueChange,
  defaultValue = [],
  placeholder = "Select options",
  maxCount = 3,
  className,
}: any) {
  const [selected, setSelected] = React.useState<string[]>(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (val: string) => {
    let newSelected;
    if (selected.includes(val)) {
      newSelected = selected.filter((item) => item !== val);
    } else {
      if (selected.length < maxCount) {
        newSelected = [...selected, val];
      } else {
        newSelected = selected;
      }
    }
    setSelected(newSelected);
    if (onValueChange) onValueChange(newSelected);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className="flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 && <span className="text-neutral-400">{placeholder}</span>}
        {selected.map((val) => {
          const opt = options.find((o: any) => o.value === val);
          return (
            <div key={val} className="flex items-center gap-1 rounded-md bg-primary-orange/20 px-2 py-1 text-xs text-primary-orange">
              {opt?.icon && <opt.icon className="h-3 w-3" />}
              {opt?.label || val}
              <div
                className="cursor-pointer ml-1 text-primary-orange hover:text-glow-orange"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(val);
                }}
              >
                <X className="h-3 w-3" />
              </div>
            </div>
          );
        })}
      </div>
      {isOpen && (
        <div className="absolute top-full mt-1 w-full z-50 rounded-md border border-white/10 bg-[#15171D] p-1 shadow-xl">
          {options.map((opt: any) => {
            const isSelected = selected.includes(opt.value);
            const disabled = opt.disable || (selected.length >= maxCount && !isSelected);
            return (
              <div
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-neutral-300 hover:bg-white/5 hover:text-white",
                  {
                    "bg-white/10 text-white": isSelected,
                    "opacity-50 cursor-not-allowed": disabled,
                  }
                )}
                onClick={() => {
                  if (!disabled) handleSelect(opt.value);
                }}
              >
                {opt.icon && <opt.icon className="h-4 w-4" />}
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
