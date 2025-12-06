import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-sm hover:shadow-neon-yellow",
        secondary: "border-secondary/30 bg-secondary/20 text-secondary hover:bg-secondary/30",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border-border/50 text-foreground bg-transparent hover:bg-muted/50",
        success: "border-emerald-500/30 bg-emerald-500/20 text-emerald-400",
        warning: "border-amber-500/30 bg-amber-500/20 text-amber-400",
        cyan: "border-secondary/30 bg-secondary/10 text-secondary shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
