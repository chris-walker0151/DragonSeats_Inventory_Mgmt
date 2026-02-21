import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        "hub-cle":
          "bg-[var(--hub-cle)]/15 text-[var(--hub-cle)] border-[var(--hub-cle)]/30",
        "hub-kc":
          "bg-[var(--hub-kc)]/15 text-[var(--hub-kc)] border-[var(--hub-kc)]/30",
        "hub-jax":
          "bg-[var(--hub-jax)]/15 text-[var(--hub-jax)] border-[var(--hub-jax)]/30",
        active:
          "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        warning:
          "bg-amber-500/15 text-amber-400 border-amber-500/30",
        info:
          "bg-sky-500/15 text-sky-400 border-sky-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

/** Small colored dot indicator for status badges */
function StatusDot({ color = "currentColor", pulse = false }: { color?: string; pulse?: boolean }) {
  return (
    <span
      className={cn("inline-block h-1.5 w-1.5 rounded-full", pulse && "animate-pulse-dot")}
      style={{ backgroundColor: color }}
    />
  )
}

export { Badge, StatusDot, badgeVariants }
