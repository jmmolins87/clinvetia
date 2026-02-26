"use client"

import { cn } from "@/lib/utils"

interface SectionBackgroundProps {
  variant?: "primary" | "secondary" | "accent" | "mixed"
  className?: string
}

export function SectionBackground({ variant = "primary", className }: SectionBackgroundProps) {
  return (
    <div className={cn("bg-glow-container pointer-events-none", className)}>
      {variant === "primary" && (
        <>
          <div 
            className="glow-orb bg-primary h-[400px] w-[400px] -top-20 -left-20" 
            style={{ animation: 'float 15s infinite ease-in-out' }}
          />
          <div 
            className="glow-orb bg-accent h-[300px] w-[300px] bottom-0 right-0" 
            style={{ animation: 'float 20s infinite ease-in-out reverse' }}
          />
        </>
      )}

      {variant === "secondary" && (
        <>
          <div 
            className="glow-orb bg-secondary h-[500px] w-[500px] top-1/2 -right-20" 
            style={{ animation: 'float 18s infinite ease-in-out' }}
          />
          <div 
            className="glow-orb bg-primary h-[300px] w-[300px] -bottom-10 left-1/4" 
            style={{ animation: 'float 25s infinite ease-in-out 2s' }}
          />
        </>
      )}

      {variant === "accent" && (
        <>
          <div 
            className="glow-orb bg-accent h-[400px] w-[400px] top-0 left-1/3" 
            style={{ animation: 'float 22s infinite ease-in-out' }}
          />
          <div 
            className="glow-orb bg-secondary h-[350px] w-[350px] bottom-20 -left-10" 
            style={{ animation: 'float 16s infinite ease-in-out 1s' }}
          />
        </>
      )}

      {variant === "mixed" && (
        <>
          <div 
            className="glow-orb bg-primary h-[300px] w-[300px] top-0 left-0" 
            style={{ animation: 'float 20s infinite ease-in-out' }}
          />
          <div 
            className="glow-orb bg-secondary h-[300px] w-[300px] top-1/2 right-0" 
            style={{ animation: 'float 15s infinite ease-in-out 5s' }}
          />
          <div 
            className="glow-orb bg-accent h-[300px] w-[300px] bottom-0 left-1/2" 
            style={{ animation: 'float 25s infinite ease-in-out 2s' }}
          />
        </>
      )}
      
      {/* Sutil malla de puntos para textura */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(var(--white-rgb),0.08)_1px,transparent_1px)] [background-size:32px_32px] dark:bg-[radial-gradient(rgba(var(--white-rgb),0.03)_1px,transparent_1px)]" />
    </div>
  )
}
