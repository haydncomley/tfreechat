import { cva, type VariantProps } from 'class-variance-authority';
import classNames from 'classnames';

// Main glass effect utility
export const glassVariants = cva(
  "relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-background-glass shadow-glass-light shadow-glass-dark backdrop-blur-md",
        fill: "bg-background/60 backdrop-blur-[6px]",
        accent: "bg-accent-quaternary/80 shadow-glass-light-lg shadow-glass-dark-lg backdrop-blur-[6px]",
        subtle: "bg-background-glass/50 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Simple glass utility function for basic glass effect
export const glass = (variant: "default" | "fill" | "accent" | "subtle" = "default") => {
  return glassVariants({ variant });
};

// Advanced glass utility with custom className merging
export const glassEffect = (variant: "default" | "fill" | "accent" | "subtle" = "default", className?: string) => {
  return classNames(glassVariants({ variant }), className);
};

// Export types for TypeScript support
export type GlassVariant = "default" | "fill" | "accent" | "subtle";
export type GlassVariantProps = VariantProps<typeof glassVariants>;