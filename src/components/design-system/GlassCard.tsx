import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * DESIGN SYSTEM - GlassCard Component
 * Smaller cards for items, projects, rooms, sub-sections
 * Hover effects with lift and glow
 */

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "highlight";
  glowColor?: "yellow" | "cyan" | "none";
  hoverable?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glowColor = "none", hoverable = true, children, ...props }, ref) => {
    const variants = {
      default: "bg-glass-medium border-glass-border",
      interactive: "bg-glass-light border-glass-border cursor-pointer",
      highlight: "bg-glass-medium border-neon-cyan/20",
    };

    const glowEffects = {
      none: hoverable ? "hover:shadow-glass-hover hover:border-accent/30" : "",
      yellow: "hover:shadow-glow-yellow hover:border-neon-yellow/40",
      cyan: "hover:shadow-glow-cyan hover:border-neon-cyan/40",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border p-4 backdrop-blur-glass shadow-glass",
          "transition-all duration-300",
          hoverable && "hover:-translate-y-1",
          "animate-fade-in",
          variants[variant],
          glowEffects[glowColor],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
