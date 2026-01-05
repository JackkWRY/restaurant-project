/**
 * @file Button Component
 * @description Reusable button component with variant and size options
 * 
 * This component provides:
 * - Multiple button variants (default, destructive, outline, secondary, ghost, link)
 * - Multiple size options (default, sm, lg, icon variants)
 * - Polymorphic rendering via Radix UI Slot
 * - Full accessibility support
 * - Consistent styling with CVA (class-variance-authority)
 * 
 * Features:
 * - Variant-based styling
 * - Size variations
 * - Icon button support
 * - Disabled state handling
 * - Focus and hover states
 * - Dark mode support
 * - Can render as child component (asChild)
 * 
 * @module components/ui/button
 * @requires react
 * @requires @radix-ui/react-slot
 * @requires class-variance-authority
 * 
 * @see {@link https://ui.shadcn.com/docs/components/button}
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button variant styles using CVA
 * Defines all possible button variants and sizes
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Button Component
 * 
 * Polymorphic button component with multiple variants and sizes.
 * Can render as different elements using the asChild prop.
 * 
 * @param props - Button props
 * @param props.variant - Button variant style
 * @param props.size - Button size
 * @param props.asChild - Render as child component (Slot)
 * @returns JSX.Element
 * 
 * @example
 * // Default button
 * <Button>Click me</Button>
 * 
 * @example
 * // Destructive button
 * <Button variant="destructive">Delete</Button>
 * 
 * @example
 * // Icon button
 * <Button size="icon"><Icon /></Button>
 * 
 * @example
 * // As Link component
 * <Button asChild>
 *   <Link href="/path">Navigate</Link>
 * </Button>
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
