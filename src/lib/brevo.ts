type BrevoAttachment = {
  name: string
  content: string
  contentType?: string
}

export async function sendBrevoEmail(params: {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  attachments?: BrevoAttachment[]
  replyTo?: { email: string; name?: string }
}) {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const senderName = process.env.BREVO_SENDER_NAME || "Clinvetia"

  if (!apiKey || !senderEmail) {
    return { ok: false, error: "Brevo not configured" }
  }

  const body = {
    sender: { email: senderEmail, name: senderName },
    to: params.to,
    subject: params.subject,
    htmlContent: params.htmlContent,
    attachment: params.attachments,
    replyTo: params.replyTo,
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    return { ok: false, error: text || "Brevo error" }
  }

  return { ok: true }
}
