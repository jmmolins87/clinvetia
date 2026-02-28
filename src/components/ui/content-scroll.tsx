import * as React from "react"

import { cn } from "@/lib/utils"

export interface ContentScrollProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ContentScroll({ className, ...props }: ContentScrollProps) {
  return (
    <div
      className={cn("max-h-[calc(100vh-8rem)] overflow-y-auto pr-2", className)}
      {...props}
    />
  )
}
