"use client"

import * as React from "react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@workspace/ui/lib/utils"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "@workspace/ui/icons"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames()

  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        ...defaults,
        root: cn("rdp-root", defaults.root),
        month: cn("space-y-3", defaults.month),
        month_caption: cn(
          "flex h-7 items-center justify-center px-7 font-mono text-[11px] uppercase tracking-widest text-foreground",
          defaults.month_caption
        ),
        nav: cn(
          "absolute inset-x-1 top-3 flex items-center justify-between",
          defaults.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "size-7 p-0 opacity-70 hover:opacity-100",
          defaults.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "size-7 p-0 opacity-70 hover:opacity-100",
          defaults.button_next
        ),
        month_grid: cn("w-full border-collapse space-y-1", defaults.month_grid),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn(
          "w-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
          defaults.weekday
        ),
        week: cn("mt-1 flex w-full", defaults.week),
        day: cn(
          "relative size-8 p-0 text-center text-xs focus-within:relative focus-within:z-20",
          defaults.day
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-8 p-0 font-normal aria-selected:opacity-100",
          defaults.day_button
        ),
        range_start: cn(
          "bg-primary/20 text-primary aria-selected:bg-primary aria-selected:text-primary-foreground",
          defaults.range_start
        ),
        range_end: cn(
          "bg-primary/20 text-primary aria-selected:bg-primary aria-selected:text-primary-foreground",
          defaults.range_end
        ),
        range_middle: cn(
          "bg-accent text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground",
          defaults.range_middle
        ),
        selected: cn(
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          defaults.selected
        ),
        today: cn(
          "border border-primary text-primary",
          defaults.today
        ),
        outside: cn(
          "text-muted-foreground/40 aria-selected:bg-accent/40 aria-selected:text-muted-foreground/40",
          defaults.outside
        ),
        disabled: cn("text-muted-foreground/40 opacity-40", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") {
            return <RiArrowLeftSLine className="size-4" />
          }
          return <RiArrowRightSLine className="size-4" />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
