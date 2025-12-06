import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-border/50 bg-input/50 px-4 py-2.5",
          "text-base text-foreground placeholder:text-muted-foreground",
          "backdrop-blur-sm",
          "ring-offset-background transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent/50",
          "focus-visible:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.2)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
