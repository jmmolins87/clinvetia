import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-2xl px-5 py-4 text-sm text-foreground ring-offset-background resize-y bg-[var(--field-bg)] backdrop-blur-xl border border-[var(--field-border)] shadow-[var(--field-shadow)] placeholder:text-muted-foreground/60 hover:border-[var(--field-border-hover)] hover:shadow-[var(--field-shadow-hover)] focus-visible:outline-none focus-visible:border-[var(--field-focus-border)] focus-visible:shadow-[var(--field-focus-shadow)] disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
