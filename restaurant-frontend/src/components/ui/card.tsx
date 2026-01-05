/**
 * @file Card Component
 * @description Reusable card component with composable sub-components
 * 
 * This component provides:
 * - Card container with consistent styling
 * - CardHeader for title and actions
 * - CardTitle for heading text
 * - CardDescription for subtitle text
 * - CardAction for header actions
 * - CardContent for main content
 * - CardFooter for bottom actions
 * 
 * Features:
 * - Composable architecture
 * - Flexible layout with CSS Grid
 * - Consistent spacing and borders
 * - Shadow and rounded corners
 * - Dark mode support
 * - Container queries for responsive design
 * 
 * @module components/ui/card
 * @requires react
 * 
 * @see {@link https://ui.shadcn.com/docs/components/card}
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card Component
 * 
 * Main card container with border, shadow, and padding.
 * 
 * @param props - Card props
 * @returns JSX.Element
 * 
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *   </CardHeader>
 *   <CardContent>Content</CardContent>
 * </Card>
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * CardHeader Component
 * 
 * Header section with grid layout for title and actions.
 * 
 * @param props - CardHeader props
 * @returns JSX.Element
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * CardTitle Component
 * 
 * Title text with semibold font.
 * 
 * @param props - CardTitle props
 * @returns JSX.Element
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * CardDescription Component
 * 
 * Subtitle text with muted color.
 * 
 * @param props - CardDescription props
 * @returns JSX.Element
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * CardAction Component
 * 
 * Action buttons positioned in header top-right.
 * 
 * @param props - CardAction props
 * @returns JSX.Element
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * CardContent Component
 * 
 * Main content area with horizontal padding.
 * 
 * @param props - CardContent props
 * @returns JSX.Element
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * CardFooter Component
 * 
 * Footer section for actions, typically with border-top.
 * 
 * @param props - CardFooter props
 * @returns JSX.Element
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
