import { Types } from "mongoose"
import { Contact } from "@/models/Contact"
import { Session } from "@/models/Session"

const ROI_RESET = {
  "roi.monthlyPatients": null,
  "roi.averageTicket": null,
  "roi.conversionLoss": null,
  "roi.roi": null,
} as const

function uniqueTokens(tokens: Array<string | null | undefined>) {
  return [...new Set(tokens.map((token) => (token || "").trim()).filter(Boolean))]
}

export async function clearRoiForSessionTokens(tokens: Array<string | null | undefined>) {
  const validTokens = uniqueTokens(tokens)
  if (!validTokens.length) return
  await Session.deleteMany({ token: { $in: validTokens } })
}

export async function clearRoiForBookingContext(params: {
  bookingId: string
  bookingSessionToken?: string | null
  contactSessionToken?: string | null
}) {
  if (!Types.ObjectId.isValid(params.bookingId)) return

  const contacts = await Contact.find({ bookingId: params.bookingId })
    .select("sessionToken")
    .lean<Array<{ sessionToken?: unknown }>>()
  const contactTokens = contacts
    .map((contact) => (contact.sessionToken ? String(contact.sessionToken) : null))
    .filter(Boolean)

  await Contact.updateMany({ bookingId: params.bookingId }, { $set: ROI_RESET })
  await clearRoiForSessionTokens([
    params.bookingSessionToken,
    params.contactSessionToken,
    ...contactTokens,
  ])
}

export async function clearRoiForLeadContext(params: {
  contactId: string
  bookingId?: string | null
  sessionToken?: string | null
}) {
  const tokens: Array<string | null | undefined> = [params.sessionToken]

  if (Types.ObjectId.isValid(params.contactId)) {
    const contact = await Contact.findById(params.contactId)
      .select("sessionToken")
      .lean<{ sessionToken?: unknown } | null>()
    if (contact?.sessionToken) tokens.push(String(contact.sessionToken))
    await Contact.updateOne({ _id: params.contactId }, { $set: ROI_RESET })
  }

  if (params.bookingId && Types.ObjectId.isValid(params.bookingId)) {
    const contacts = await Contact.find({ bookingId: params.bookingId })
      .select("sessionToken")
      .lean<Array<{ sessionToken?: unknown }>>()
    for (const contact of contacts) {
      if (contact.sessionToken) tokens.push(String(contact.sessionToken))
    }
    await Contact.updateMany({ bookingId: params.bookingId }, { $set: ROI_RESET })
  }

  await clearRoiForSessionTokens(tokens)
}
