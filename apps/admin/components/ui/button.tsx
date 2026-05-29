"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:scale-[0.99] disabled:pointer-events-none disabled:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white hover:bg-slate-800 aria-pressed:bg-slate-950 disabled:bg-slate-200 disabled:text-slate-500",
        outline:
          "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 aria-pressed:bg-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 aria-pressed:bg-red-700 disabled:bg-red-200 disabled:text-red-50"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
