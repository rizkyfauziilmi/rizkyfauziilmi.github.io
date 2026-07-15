import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { CaretLeftIcon, CaretRightIcon, CaretDownIcon } from "@phosphor-icons/react"

const calendarRootVariants = cva(
  "group/calendar p-3 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(6)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent rtl:**:[.rdp-button\\_next>svg]:rotate-180 rtl:**:[.rdp-button\\_previous>svg]:rotate-180",
  {
    variants: {
      variant: {
        default: "bg-background",
        invert: "bg-primary text-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const calendarTodayVariants = cva(
  "rounded-(--cell-radius) data-[selected=true]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground",
        invert: "bg-background/10 text-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const calendarDayVariants = cva(
  "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
  {
    variants: {
      variant: {
        default:
          "hover:bg-muted data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground",
        invert:
          "hover:bg-background/10 hover:text-background data-[selected-single=true]:bg-background data-[selected-single=true]:text-foreground data-[range-start=true]:bg-background data-[range-start=true]:text-foreground data-[range-end=true]:bg-background data-[range-end=true]:text-foreground data-[range-middle=true]:bg-background/10 data-[range-middle=true]:text-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const calendarRangeStartVariants = cva(
  "relative isolate z-0 rounded-l-(--cell-radius) after:absolute after:inset-y-0 after:right-0 after:w-4",
  {
    variants: {
      variant: {
        default: "bg-muted after:bg-muted",
        invert: "bg-background/10 after:bg-background/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const calendarRangeEndVariants = cva(
  "relative isolate z-0 rounded-r-(--cell-radius) after:absolute after:inset-y-0 after:left-0 after:w-4",
  {
    variants: {
      variant: {
        default: "bg-muted after:bg-muted",
        invert: "bg-background/10 after:bg-background/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant,
  variant = "default",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  variant?: VariantProps<typeof calendarRootVariants>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  // Map default & invert button variant fallbacks
  const buttonVariantMap = {
    default: "ghost",
    invert: "ghostInvert",
  } as const

  const resolvedButtonVariant = buttonVariant ?? buttonVariantMap[variant ?? "default"]

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(calendarRootVariants({ variant }), className)}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: resolvedButtonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: resolvedButtonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-(--cell-radius)",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "font-medium select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
            : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
          defaultClassNames.day
        ),
        range_start: cn(
          calendarRangeStartVariants({ variant }),
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          calendarRangeEndVariants({ variant }),
          defaultClassNames.range_end
        ),
        today: cn(
          calendarTodayVariants({ variant }),
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <CaretLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <CaretRightIcon className={cn("size-4", className)} {...props} />
            )
          }

          return (
            <CaretDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton
            locale={locale}
            variant={variant}
            buttonVariant={resolvedButtonVariant}
            {...props}
          />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  variant,
  buttonVariant,
  ...props
}: React.ComponentProps<typeof DayButton> & {
  locale?: Partial<Locale>
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
} & VariantProps<typeof calendarDayVariants>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const buttonVariantMap = {
    default: "ghost",
    invert: "ghostInvert",
  } as const

  const resolvedButtonVariant = buttonVariant ?? buttonVariantMap[variant ?? "default"]

  return (
    <Button
      variant={resolvedButtonVariant}
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        calendarDayVariants({ variant }),
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export {
  Calendar,
  CalendarDayButton,
}
