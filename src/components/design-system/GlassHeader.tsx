import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * DESIGN SYSTEM - GlassHeader Component
 * Top navigation bar with glassmorphism
 */

interface GlassHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  sticky?: boolean;
}

const GlassHeader = React.forwardRef<HTMLDivElement, GlassHeaderProps>(
  ({ className, sticky = true, children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          "w-full px-6 py-4",
          "bg-glass-medium/80 backdrop-blur-glass-lg",
          "border-b border-glass-border",
          "shadow-glass",
          sticky && "sticky top-0 z-50",
          className
        )}
        {...props}
      >
        {children}
      </header>
    );
  }
);
GlassHeader.displayName = "GlassHeader";

export { GlassHeader };
