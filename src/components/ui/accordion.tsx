"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & { last?: boolean }
>(({ className, last, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(!last && "border-b border-[rgba(var(--white-rgb),0.10)]", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "group flex flex-1 items-center justify-between py-4 text-base font-medium text-left",
        "transition-all duration-300 ease-out",
        "text-muted-foreground hover:text-primary cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "[&[data-state=open]_.accordion-chevron]:rotate-180 [&[data-state=open]]:text-primary",
        className
      )}
      {...props}
    >
      <span className="transition-colors duration-300 group-hover:text-primary group-[&[data-state=open]]:text-primary">
        {children}
      </span>
      <Icon
        icon={ChevronDown}
        size="sm"
        variant="muted"
        className="accordion-chevron shrink-0 transition-transform duration-300 ease-out group-hover:text-primary group-[&[data-state=open]]:text-primary"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
      "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    )}
    {...props}
  >
    <div className={cn("pb-4 pt-0 text-muted-foreground", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
