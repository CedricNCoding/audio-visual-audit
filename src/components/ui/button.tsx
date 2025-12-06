import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold",
    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    // Motion: smooth transitions
    "transition-all duration-200 ease-out",
    // Motion: active state
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground shadow-lg",
          // Motion: hover effects
          "hover:shadow-neon-yellow hover:scale-[1.02]",
          "hover:brightness-110",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90 hover:shadow-lg",
          "hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
        ].join(" "),
        outline: [
          "border border-border bg-transparent",
          "hover:bg-accent/10 hover:border-accent hover:text-accent",
          "hover:shadow-neon-cyan",
        ].join(" "),
        secondary: [
          "bg-secondary/20 text-secondary border border-secondary/30",
          "hover:bg-secondary/30 hover:shadow-neon-cyan hover:scale-[1.02]",
        ].join(" "),
        ghost: [
          "hover:bg-muted/50 hover:text-foreground",
        ].join(" "),
        link: [
          "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        ].join(" "),
        glass: [
          "glass border-border hover:border-accent/50 hover:shadow-glass-hover text-foreground",
          "hover:bg-glass-medium",
        ].join(" "),
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
