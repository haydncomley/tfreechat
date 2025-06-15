import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { icons } from "lucide-react"
import type { IconName } from "~/components"

import classNames from "classnames"
import { glass } from "~/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: classNames(glass("accent"), "text-accent-foreground hover:bg-accent-quaternary/90"),
        secondary: classNames(glass("default"), "text-accent-foreground hover:bg-background-glass/80"),
      },
      size: {
        default: "h-[2.75rem] px-4 py-2",
        icon: "w-[2.75rem] h-[2.75rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

type BaseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

type DefaultButtonProps = BaseButtonProps & {
  size?: "default"
  icon?: never
  iconPosition?: "left" | "right"
  children: React.ReactNode
}

type IconButtonProps = BaseButtonProps & {
  size: "icon"
  icon: IconName
  iconPosition?: never
  children?: never
}

export type ButtonProps = DefaultButtonProps | IconButtonProps

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon, iconPosition, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={classNames(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {size === "icon" || iconPosition === "left" && icon ? (
          (() => {
            const LucideIcon = icons[icon]
            return <LucideIcon size={16} />
          })()
        ) : null}
        {children}
        {size !== "icon" && iconPosition === "right" && icon ? (
          (() => {
            const LucideIcon = icons[icon]
            return <LucideIcon size={16} />
          })()
        ) : null}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }