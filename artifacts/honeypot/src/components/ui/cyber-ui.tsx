import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export const CyberCard = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn(
        "relative bg-card/80 backdrop-blur-md border border-card-border p-6 rounded-none",
        "before:absolute before:top-0 before:left-0 before:w-2 before:h-2 before:border-t-2 before:border-l-2 before:border-primary",
        "after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:border-b-2 after:border-r-2 after:border-primary",
        "hover:border-primary/50 transition-colors duration-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
);
CyberCard.displayName = "CyberCard";

export const CyberButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'destructive' | 'outline' }>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: "bg-primary/10 text-primary border-primary hover:bg-primary hover:text-primary-foreground cyber-glow",
      destructive: "bg-destructive/10 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground cyber-glow-red",
      outline: "bg-transparent text-foreground border-border hover:border-primary hover:text-primary"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative px-6 py-2.5 font-display font-semibold uppercase tracking-wider text-sm border",
          "transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
CyberButton.displayName = "CyberButton";

export const CyberBadge = ({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'destructive' | 'success' | 'warning', className?: string }) => {
  const variants = {
    default: "bg-primary/20 text-primary border-primary/30",
    destructive: "bg-destructive/20 text-destructive border-destructive/30",
    success: "bg-success/20 text-success border-success/30",
    warning: "bg-warning/20 text-warning border-warning/30",
  };
  return (
    <span className={cn("px-2.5 py-1 text-xs font-display font-bold uppercase tracking-wider border rounded-sm", variants[variant], className)}>
      {children}
    </span>
  );
};

export const CyberInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full bg-background/50 border border-border px-4 py-3 text-foreground font-sans",
        "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all",
        "placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);
CyberInput.displayName = "CyberInput";
