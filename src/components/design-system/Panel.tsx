import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * DESIGN SYSTEM - Panel Component
 * Main container for sections, forms, and content blocks
 * Uses glassmorphism with blur, subtle border, and soft shadow
 */

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle";
  neonBorder?: "none" | "yellow" | "cyan";
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, variant = "default", neonBorder = "none", ...props }, ref) => {
    const variants = {
      default: "bg-glass-light backdrop-blur-glass border-glass-border shadow-glass",
      elevated: "bg-glass-medium backdrop-blur-glass-lg border-glass-border shadow-glass-hover",
      subtle: "bg-glass-subtle backdrop-blur-glass-sm border-glass-border/50 shadow-soft",
    };

    const neonBorders = {
      none: "",
      yellow: "border-neon-yellow/30 shadow-glow-yellow",
      cyan: "border-neon-cyan/30 shadow-glow-cyan",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border p-6 transition-all duration-300",
          "animate-fade-in-up",
          variants[variant],
          neonBorders[neonBorder],
          className
        )}
        {...props}
      />
    );
  }
);
Panel.displayName = "Panel";

const PanelHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 pb-4", className)}
    {...props}
  />
));
PanelHeader.displayName = "PanelHeader";

const PanelTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { glow?: "yellow" | "cyan" | "none" }
>(({ className, glow = "none", ...props }, ref) => {
  const glowClasses = {
    none: "",
    yellow: "text-neon-yellow drop-shadow-[0_0_10px_hsl(var(--neon-yellow)/0.5)]",
    cyan: "text-neon-cyan drop-shadow-[0_0_10px_hsl(var(--neon-cyan)/0.5)]",
  };

  return (
    <h3
      ref={ref}
      className={cn(
        "text-xl font-semibold leading-none tracking-tight font-display text-foreground",
        glowClasses[glow],
        className
      )}
      {...props}
    />
  );
});
PanelTitle.displayName = "PanelTitle";

const PanelDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
PanelDescription.displayName = "PanelDescription";

const PanelContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-2", className)} {...props} />
));
PanelContent.displayName = "PanelContent";

export { Panel, PanelHeader, PanelTitle, PanelDescription, PanelContent };
