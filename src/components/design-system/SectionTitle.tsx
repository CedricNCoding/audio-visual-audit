import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * DESIGN SYSTEM - SectionTitle Component
 * Large section headers with optional glow separator
 */

interface SectionTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  glow?: "yellow" | "cyan" | "none";
  showSeparator?: boolean;
}

const SectionTitle = React.forwardRef<HTMLDivElement, SectionTitleProps>(
  ({ className, title, subtitle, icon, glow = "none", showSeparator = true, ...props }, ref) => {
    const glowClasses = {
      none: "",
      yellow: "text-neon-yellow",
      cyan: "text-neon-cyan",
    };

    const separatorGlow = {
      none: "from-transparent via-border to-transparent",
      yellow: "from-transparent via-neon-yellow/50 to-transparent",
      cyan: "from-transparent via-neon-cyan/50 to-transparent",
    };

    return (
      <div ref={ref} className={cn("space-y-3 mb-6", className)} {...props}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn("text-muted-foreground", glowClasses[glow])}>
              {icon}
            </div>
          )}
          <div className="space-y-1">
            <h2 className={cn(
              "text-2xl font-semibold font-display tracking-tight",
              glowClasses[glow]
            )}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {showSeparator && (
          <div className={cn(
            "h-px bg-gradient-to-r",
            separatorGlow[glow]
          )} />
        )}
      </div>
    );
  }
);
SectionTitle.displayName = "SectionTitle";

export { SectionTitle };
