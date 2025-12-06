import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * DESIGN SYSTEM - Tag Component
 * Small glass badge with neon border
 */

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "yellow" | "cyan" | "default" | "success" | "warning" | "error";
  size?: "sm" | "md";
}

const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant = "default", size = "sm", children, ...props }, ref) => {
    const variants = {
      default: "bg-glass-light border-glass-border text-foreground",
      yellow: "bg-neon-yellow/10 border-neon-yellow/30 text-neon-yellow",
      cyan: "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan",
      success: "bg-green-500/10 border-green-500/30 text-green-400",
      warning: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      error: "bg-red-500/10 border-red-500/30 text-red-400",
    };

    const sizes = {
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-3 py-1",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border backdrop-blur-sm font-medium",
          "transition-all duration-200",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Tag.displayName = "Tag";

export { Tag };
