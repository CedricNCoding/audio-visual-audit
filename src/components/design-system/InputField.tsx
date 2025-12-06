import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * DESIGN SYSTEM - InputField Component
 * Glass input with label, focus glow effect
 */

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  focusGlow?: "cyan" | "yellow";
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, label, error, helperText, focusGlow = "cyan", id, ...props }, ref) => {
    const inputId = id || React.useId();

    const glowClasses = {
      cyan: "focus:border-neon-cyan/50 focus:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.15)]",
      yellow: "focus:border-neon-yellow/50 focus:shadow-[0_0_15px_hsl(var(--neon-yellow)/0.15)]",
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label
            htmlFor={inputId}
            className="text-sm text-muted-foreground font-medium"
          >
            {label}
          </Label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-11 w-full rounded-xl border px-4 py-2 text-sm",
            "bg-glass-light border-glass-border backdrop-blur-glass",
            "text-foreground placeholder:text-muted-foreground/50",
            "transition-all duration-300 outline-none",
            "hover:border-accent/30",
            glowClasses[focusGlow],
            error && "border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
InputField.displayName = "InputField";

export { InputField };
