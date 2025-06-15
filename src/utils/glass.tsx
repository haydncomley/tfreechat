import { cva, type VariantProps } from 'class-variance-authority';
import classNames from 'classnames';

// Define base glass container styles
const baseStyles = "relative overflow-hidden outline outline-1 outline-offset-[-1px] outline-foreground/10 transition-all duration-200";

// Define glass effect styles
const glassStyles = {
  default: "bg-background-glass shadow-glass-light shadow-glass-dark backdrop-blur-md",
  fill: "bg-background/60 backdrop-blur-[6px]",
  accent: "bg-accent-quaternary/80 shadow-glass-light-lg shadow-glass-dark-lg backdrop-blur-[6px]",
  subtle: "bg-background-glass/50 backdrop-blur-sm",
} as const;

// Helper to convert styles to hover-only styles
const toHoverStyles = (styles: string) => 
  styles.split(' ').map(style => `hover:${style}`).join(' ');

// Main glass effect utility
export const glassVariants = cva(
  "", // No base styles - all applied conditionally
  {
    variants: {
      variant: {
        default: "",
        fill: "",
        accent: "",
        subtle: "",
      },
      hover: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // Always applied styles (hover: false) - base + glass
      { variant: "default", hover: false, class: classNames(baseStyles, glassStyles.default) },
      { variant: "fill", hover: false, class: classNames(baseStyles, glassStyles.fill) },
      { variant: "accent", hover: false, class: classNames(baseStyles, glassStyles.accent) },
      { variant: "subtle", hover: false, class: classNames(baseStyles, glassStyles.subtle) },
      
      // Hover-only styles (hover: true) - everything on hover
      { variant: "default", hover: true, class: classNames(toHoverStyles(baseStyles), toHoverStyles(glassStyles.default)) },
      { variant: "fill", hover: true, class: classNames(toHoverStyles(baseStyles), toHoverStyles(glassStyles.fill)) },
      { variant: "accent", hover: true, class: classNames(toHoverStyles(baseStyles), toHoverStyles(glassStyles.accent)) },
      { variant: "subtle", hover: true, class: classNames(toHoverStyles(baseStyles), toHoverStyles(glassStyles.subtle)) },
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