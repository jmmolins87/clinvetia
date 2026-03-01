import * as React from "react"

import { cn } from "@/lib/utils"

export type ContentScrollProps = React.HTMLAttributes<HTMLDivElement>

export const ContentScroll = React.forwardRef<HTMLDivElement, ContentScrollProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "min-h-0 h-full overflow-y-auto overscroll-contain pr-2 [touch-action:pan-y] [-webkit-overflow-scrolling:touch]",
        className,
      )}
      {...props}
    />
  ),
)
ContentScroll.displayName = "ContentScroll"
