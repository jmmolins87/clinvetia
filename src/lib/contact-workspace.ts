export type ContactWorkspaceDetail = {
  id: string
  nombre: string
  email: string
  telefono?: string
  clinica: string
  mensaje?: string
  createdAt: string
  roi?: {
    monthlyPatients?: number
    averageTicket?: number
    conversionLoss?: number
    roi?: number
  }
  booking?: {
    id: string
    date: string
    time: string
    duration: number
    status: string
  } | null
}

type ContactWorkspaceRecord = {
  id: string
  label: string
  status: string
  date: string
  amount?: number
  description: string
}

type ContactWorkspaceActivity = {
  id: string
  label: string
  detail: string
  date: string
  tone: "primary" | "secondary" | "accent"
}

export type ContactWorkspacePayload = {
  contact: ContactWorkspaceDetail
  metrics: {
    presupuestos: number
    trabajos: number
    facturas: number
    actividad: number
  }
  presupuestos: ContactWorkspaceRecord[]
  trabajos: ContactWorkspaceRecord[]
  facturas: ContactWorkspaceRecord[]
  actividad: ContactWorkspaceActivity[]
}

function bookingStatusLabel(status?: string) {
  if (status === "confirmed") return "Confirmada"
  if (status === "pending") return "Pendiente"
  if (status === "cancelled") return "Cancelada"
  if (status === "expired") return "Expirada"
  if (status === "rescheduled") return "Reprogramada"
  return "Sin estado"
}

function addDays(date: string, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next.toISOString()
}

function buildDemoWorkspaceContent(contact: ContactWorkspaceDetail) {
  if (!contact.id.startsWith("CNT-")) {
    return {
      presupuestos: [] as ContactWorkspaceRecord[],
      trabajos: [] as ContactWorkspaceRecord[],
      facturas: [] as ContactWorkspaceRecord[],
    }
  }

  const hasActiveBooking = contact.booking && ["confirmed", "pending", "rescheduled"].includes(contact.booking.status)
  const baseDate = contact.booking?.date || contact.createdAt
  const presupuestoAmount = Math.max(690, Math.round((contact.roi?.roi ?? 120) * 6))
  const invoiceAmount = Math.max(390, Math.round(presupuestoAmount * 0.4))
  const presupuestoStatus =
    contact.booking?.status === "confirmed" || contact.booking?.status === "rescheduled"
      ? "Aprobado"
      : contact.booking?.status === "pending"
        ? "En revisión"
        : "Borrador"

  const presupuestos: ContactWorkspaceRecord[] = [
    {
      id: `presupuesto-${contact.id}-base`,
      label: "Implantación operativa ClinvetIA",
      status: presupuestoStatus,
      date: addDays(baseDate, -1),
      amount: presupuestoAmount,
      description: "Onboarding, automatización de agenda y seguimiento comercial.",
    },
  ]

  const trabajos: ContactWorkspaceRecord[] = [
    {
      id: `trabajo-${contact.id}-seguimiento`,
      label: "Seguimiento comercial",
      status: hasActiveBooking ? "Activo" : "En pausa",
      date: addDays(baseDate, 1),
      description: contact.booking
        ? `${contact.booking.time} · ${contact.booking.duration} min · ${bookingStatusLabel(contact.booking.status)}`
        : "Pendiente de programar próxima acción.",
    },
    ...(contact.booking?.status === "confirmed" || contact.booking?.status === "rescheduled"
      ? [
          {
            id: `trabajo-${contact.id}-onboarding`,
            label: "Preparación de onboarding",
            status: "Planificado",
            date: addDays(baseDate, 3),
            description: "Configuración inicial de flujos, formularios y avisos automáticos.",
          },
        ]
      : []),
  ]

  const facturas: ContactWorkspaceRecord[] =
    contact.booking?.status === "confirmed" || contact.booking?.status === "rescheduled"
      ? [
          {
            id: `factura-${contact.id}-setup`,
            label: "Factura de señal",
            status: contact.booking.status === "confirmed" ? "Emitida" : "Pendiente",
            date: addDays(baseDate, 4),
            amount: invoiceAmount,
            description: "Reserva de onboarding y activación del proyecto.",
          },
        ]
      : []

  return { presupuestos, trabajos, facturas }
}

export function buildContactWorkspace(contact: ContactWorkspaceDetail): ContactWorkspacePayload {
  const demoContent = buildDemoWorkspaceContent(contact)
  const trabajos: ContactWorkspaceRecord[] = demoContent.trabajos.length > 0
    ? demoContent.trabajos
    : contact.booking
      ? [
          {
            id: `trabajo-${contact.booking.id}`,
            label: "Seguimiento de demo",
            status: bookingStatusLabel(contact.booking.status),
            date: contact.booking.date,
            description: `${contact.booking.time} · ${contact.booking.duration} min`,
          },
        ]
      : []
  const presupuestos = demoContent.presupuestos
  const facturas = demoContent.facturas

  const actividad: ContactWorkspaceActivity[] = [
    {
      id: `${contact.id}-lead`,
      label: "Lead registrado",
      detail: `${contact.nombre} dejó sus datos para ${contact.clinica}.`,
      date: contact.createdAt,
      tone: "secondary" as const,
    },
    ...(contact.booking
      ? [
          {
            id: `${contact.id}-booking`,
            label: "Demo asociada",
            detail: `${new Date(contact.booking.date).toLocaleDateString("es-ES")} · ${contact.booking.time} · ${bookingStatusLabel(contact.booking.status)}`,
            date: contact.booking.date,
            tone: "primary" as const,
          },
        ]
      : []),
    ...(typeof contact.roi?.roi === "number"
      ? [
          {
            id: `${contact.id}-roi`,
            label: "ROI detectado",
            detail: `Estimación de retorno del ${contact.roi.roi}% para la cuenta.`,
            date: contact.createdAt,
            tone: "accent" as const,
          },
        ]
      : []),
    ...presupuestos.map((item) => ({
      id: `${item.id}-activity`,
      label: "Presupuesto generado",
      detail: `${item.label} · ${item.status}${typeof item.amount === "number" ? ` · ${item.amount}€` : ""}`,
      date: item.date,
      tone: "secondary" as const,
    })),
    ...facturas.map((item) => ({
      id: `${item.id}-activity`,
      label: "Factura preparada",
      detail: `${item.label} · ${item.status}${typeof item.amount === "number" ? ` · ${item.amount}€` : ""}`,
      date: item.date,
      tone: "primary" as const,
    })),
  ].sort((left, right) => +new Date(right.date) - +new Date(left.date))

  return {
    contact,
    metrics: {
      presupuestos: presupuestos.length,
      trabajos: trabajos.length,
      facturas: facturas.length,
      actividad: actividad.length,
    },
    presupuestos,
    trabajos,
    facturas,
    actividad,
  }
}
