"use client"

import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitive.Provider
const ToastClose = ToastPrimitive.Close

const viewportVariants = cva(
  "fixed z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]",
  {
    variants: {
      position: {
        "bottom-right": "bottom-0 right-0",
        "bottom-left": "bottom-0 left-0",
        "top-right": "top-0 right-0 flex-col",
        "top-left": "top-0 left-0 flex-col",
        "top-center": "top-0 left-1/2 -translate-x-1/2 flex-col",
        "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
      },
    },
    defaultVariants: {
      position: "bottom-right",
    },
  }
)

export type ToastPosition = VariantProps<typeof viewportVariants>["position"]

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport> &
    VariantProps<typeof viewportVariants>
>(({ className, position, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(viewportVariants({ position }), className)}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

const toastVariants = cva(
  [
    "group pointer-events-auto relative",
    "flex w-full items-center justify-between",
    "space-x-4 overflow-hidden",
    "rounded-2xl border p-4 pr-8",
    "backdrop-blur-xl",
    "shadow-[inset_0_1px_0_rgba(var(--white-rgb),0.12),0_8px_32px_rgba(var(--black-rgb),0.50)]",
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=move]:transition-none",
    "transition-all",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[swipe=end]:animate-out",
    "data-[state=closed]:fade-out-80",
    "data-[state=closed]:slide-out-to-right-full",
    "data-[state=open]:slide-in-from-top-full",
    "data-[state=open]:sm:slide-in-from-bottom-full",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "border-white/10",
          "bg-background/80",
          "text-foreground",
        ].join(" "),
        destructive: "destructive group toast-destructive",
        success: "toast-success text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
))
Toast.displayName = ToastPrimitive.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center",
      "rounded-full border border-white/20 bg-white/5",
      "px-3 text-sm font-medium",
      "text-foreground",
      "transition-all duration-200",
      "hover:bg-white/10 hover:border-white/30",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      "cursor-pointer",
      "group-[.destructive]:border-[rgba(var(--destructive-rgb),0.40)]",
      "group-[.destructive]:hover:border-[rgba(var(--destructive-rgb),0.70)]",
      "group-[.destructive]:hover:bg-[rgba(var(--destructive-rgb),0.20)]",
      "group-[.destructive]:focus:ring-destructive",
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitive.Action.displayName

const ToastCloseButton = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2",
      "rounded-full p-1 cursor-pointer",
      "text-foreground/50",
      "transition-all duration-200",
      "hover:text-foreground hover:bg-white/10",
      "focus:outline-none focus:ring-2 focus:ring-ring",
      "ring-offset-background",
      "group-[.destructive]:text-destructive-foreground/70",
      "group-[.destructive]:hover:text-destructive-foreground",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
))
ToastCloseButton.displayName = ToastPrimitive.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-sm font-semibold text-foreground", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-base text-muted-foreground", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastCloseButton,
  ToastAction,
}
