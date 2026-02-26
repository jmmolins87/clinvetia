"use client"

export function GlobalBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background w-screen max-w-full">
      {/* Orbe 1: Primario - Arriba Izquierda */}
      <div 
        className="glow-orb bg-primary h-[600px] w-[600px] -top-40 -left-40" 
        style={{ animation: 'float 25s infinite ease-in-out', opacity: 0.2 }}
      />
      
      {/* Orbe 2: Secundario - Centro Derecha */}
      <div 
        className="glow-orb bg-secondary h-[500px] w-[500px] top-1/4 -right-20" 
        style={{ animation: 'float 30s infinite ease-in-out reverse', opacity: 0.15 }}
      />
      
      {/* Orbe 3: Accent - Abajo Izquierda */}
      <div 
        className="glow-orb bg-accent h-[450px] w-[450px] bottom-1/4 -left-20" 
        style={{ animation: 'float 22s infinite ease-in-out 2s', opacity: 0.15 }}
      />
      
      {/* Orbe 4: Primario/Cian - Abajo Derecha */}
      <div 
        className="glow-orb bg-primary h-[550px] w-[550px] -bottom-40 -right-20" 
        style={{ animation: 'float 28s infinite ease-in-out 5s', opacity: 0.1 }}
      />

      {/* Malla de puntos global */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(var(--white-rgb),0.08)_1px,transparent_1px)] [background-size:40px_40px] dark:bg-[radial-gradient(rgba(var(--white-rgb),0.03)_1px,transparent_1px)]" />
      
      {/* Sutil gradiente de profundidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/40" />
    </div>
  )
}
