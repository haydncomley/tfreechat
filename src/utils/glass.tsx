import { cva, type VariantProps } from 'class-variance-authority';
import classNames from 'classnames';

// Main glass effect utility
export const glassVariants = cva(
  "relative overflow-hidden transition-all duration-200 outline outline-1 outline-offset-[-1px] outline-foreground/10",
  {
    variants: {
      variant: {
        default: "bg-background-glass shadow-glass-light shadow-glass-dark backdrop-blur-md",
        fill: "bg-background/60 backdrop-blur-[6px]",
        accent: "bg-accent-quaternary/80 shadow-glass-light-lg shadow-glass-dark-lg backdrop-blur-[6px]",
        subtle: "bg-background-glass/50 backdrop-blur-sm",
      },
      hover: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // Default variant hover states
      {
        variant: "default",
        hover: true,
        class: "hover:bg-background-glass/80 hover:backdrop-blur-lg hover:shadow-glass-light-lg hover:shadow-glass-dark-lg",
      },
      // Fill variant hover states
      {
        variant: "fill",
        hover: true,
        class: "hover:bg-background/80 hover:backdrop-blur-md",
      },
      // Accent variant hover states
      {
        variant: "accent",
        hover: true,
        class: "hover:bg-accent-quaternary/90 hover:backdrop-blur-lg",
      },
      // Subtle variant hover states
      {
        variant: "subtle",
        hover: true,
        class: "hover:bg-background-glass/70 hover:backdrop-blur-md",
      },
    ],
    defaultVariants: {
      variant: "default",
      hover: false,
    },
  }
);

// Simple glass utility function for basic glass effect
export const glass = (
  variant: "default" | "fill" | "accent" | "subtle" = "default",
  hover: boolean = false
) => {
  return glassVariants({ variant, hover });
};

// Advanced glass utility with custom className merging
export const glassEffect = (
  variant: "default" | "fill" | "accent" | "subtle" = "default",
  hover: boolean = false,
  className?: string
) => {
  return classNames(glassVariants({ variant, hover }), className);
};

// Export types for TypeScript support
export type GlassVariant = "default" | "fill" | "accent" | "subtle";
export type GlassVariantProps = VariantProps<typeof glassVariants>;