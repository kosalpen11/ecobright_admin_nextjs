 "use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, value, defaultValue, onChange, ...props }, ref) => {
    const [currentValue, setCurrentValue] = React.useState(() =>
      value !== undefined
        ? String(value)
        : defaultValue !== undefined
          ? String(defaultValue)
          : ""
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setCurrentValue(String(value));
      }
    }, [value]);

    const isEmpty = currentValue === "";

    return (
      <div className="relative">
        <select
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            "flex h-10 w-full appearance-none rounded-xl border px-3 py-2 pr-10 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 [&_option]:bg-white [&_option]:text-slate-900",
            isEmpty
              ? "border-slate-300 bg-slate-50 text-slate-500"
              : "border-slate-200 bg-white text-slate-900",
            className
          )}
          onChange={(event) => {
            setCurrentValue(event.target.value);
            onChange?.(event);
          }}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2",
            isEmpty ? "text-slate-500" : "text-slate-500"
          )}
        />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
