import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * DESIGN SYSTEM - StepItem Component
 * Navigation step indicator with glassmorphism
 */

interface StepItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  stepNumber: number;
  label: string;
  isActive?: boolean;
  isCompleted?: boolean;
  compact?: boolean;
}

const StepItem = React.forwardRef<HTMLButtonElement, StepItemProps>(
  ({ className, stepNumber, label, isActive = false, isCompleted = false, compact = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center gap-2 rounded-lg transition-all duration-300",
          "backdrop-blur-glass border whitespace-nowrap flex-shrink-0",
          compact ? "px-2 py-1.5" : "px-3 py-2",
          isActive
            ? "bg-primary text-primary-foreground border-neon-yellow/50 shadow-glow-yellow"
            : isCompleted
            ? "bg-primary/20 text-foreground border-primary/30"
            : "bg-glass-light text-muted-foreground border-glass-border hover:bg-glass-medium hover:border-accent/30",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "flex items-center justify-center rounded-full font-medium",
            compact ? "w-5 h-5 text-[10px]" : "w-6 h-6 text-xs",
            isActive
              ? "bg-primary-foreground text-primary"
              : isCompleted
              ? "bg-primary/40 text-foreground"
              : "bg-muted/50"
          )}
        >
          {stepNumber}
        </span>
        <span className={cn(compact ? "text-[11px]" : "text-sm font-medium")}>
          {label}
        </span>
      </button>
    );
  }
);
StepItem.displayName = "StepItem";

export { StepItem };
