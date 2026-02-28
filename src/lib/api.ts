export type BookingResponse = {
  bookingId: string
  accessToken?: string
  date: string
  time: string
  duration: number
  expiresAt: string
  formExpiresAt: string
  demoExpiresAt: string
  status?: string
  contactSubmitted?: boolean
  contact?: {
    nombre: string
    email: string
    telefono: string
    clinica: string
    mensaje: string
    createdAt?: string | null
    roi?: {
      monthlyPatients?: number | null
      averageTicket?: number | null
      conversionLoss?: number | null
      roi?: number | null
    } | null
  } | null
}

export type AvailabilityResponse = {
  slots: string[]
  unavailable: string[]
}

export type ContactPayload = {
  nombre: string
  email: string
  telefono: string
  clinica: string
  mensaje: string
  bookingId?: string
  accessToken?: string
  sessionToken?: string | null
  roi?: {
    monthlyPatients?: number
    averageTicket?: number
    conversionLoss?: number
    roi?: number
  }
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = data?.error || "Request failed"
    throw new ApiError(message, res.status, data)
  }

  return data as T
}

export async function createBooking(payload: {
  date: string
  time: string
  duration: number
  sessionToken?: string | null
}): Promise<BookingResponse> {
  return apiFetch<BookingResponse>("/api/booking", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getBooking(bookingId: string, accessToken: string): Promise<BookingResponse> {
  return apiFetch<BookingResponse>(`/api/booking?bookingId=${encodeURIComponent(bookingId)}`, {
    headers: { "x-booking-token": accessToken },
    cache: "no-store",
  })
}

export async function getActiveBookingBySession(sessionToken: string): Promise<(BookingResponse & { active?: boolean }) | null> {
  const data = await apiFetch<BookingResponse & { active?: boolean }>(
    `/api/booking?sessionToken=${encodeURIComponent(sessionToken)}`,
    {
      headers: { "x-session-token": sessionToken },
      cache: "no-store",
    }
  )
  if (data && data.active === false) return null
  return data
}

export async function getAvailability(date?: string): Promise<AvailabilityResponse> {
  const url = date ? `/api/availability?date=${encodeURIComponent(date)}` : "/api/availability"
  return apiFetch<AvailabilityResponse>(url, { cache: "no-store" })
}

export async function submitContact(payload: ContactPayload): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function createSession(payload?: { roi?: ContactPayload["roi"] }): Promise<{ accessToken: string; expiresAt: string }> {
  return apiFetch<{ accessToken: string; expiresAt: string }>("/api/session", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  })
}

export async function getSession(accessToken: string): Promise<{
  accessToken: string
  expiresAt: string
  roi?: {
    monthlyPatients?: number | null
    averageTicket?: number | null
    conversionLoss?: number | null
    roi?: number | null
  }
}> {
  return apiFetch(`/api/session?token=${encodeURIComponent(accessToken)}`, {
    headers: { "x-session-token": accessToken },
    cache: "no-store",
  })
}
