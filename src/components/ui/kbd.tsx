import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "cn"

const kbdVariants = cva(
  "pointer-events-none inline-flex w-fit items-center justify-center gap-1 font-sans text-xs font-medium select-none in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default: "h-5 min-w-5 rounded-sm bg-muted px-1 text-muted-foreground",
        tui: "h-4 min-w-4 rounded-none bg-muted/60 px-1 font-mono text-[0.65rem] text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Kbd({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"kbd"> & VariantProps<typeof kbdVariants>) {
  return (
    <kbd
      data-slot="kbd"
      data-variant={variant}
      className={cn(kbdVariants({ variant, className }))}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
