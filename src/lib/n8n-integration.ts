function getTrimmedEnv(name: string) {
  const value = process.env[name]?.trim()
  return value || null
}

export function getN8nWebhookUrl() {
  const url = getTrimmedEnv("N8N_WEBHOOK_URL")
  return url || null
}

export function isN8nConfigured() {
  return Boolean(getN8nWebhookUrl())
}

export function getN8nChatWebhookUrl() {
  return getTrimmedEnv("N8N_CHAT_WEBHOOK_URL") || getN8nWebhookUrl()
}

export function getN8nChatWebhookSecret() {
  return getTrimmedEnv("N8N_CHAT_WEBHOOK_SECRET") || getTrimmedEnv("N8N_WEBHOOK_SECRET")
}

export function isN8nChatConfigured() {
  return Boolean(getN8nChatWebhookUrl())
}

export function getN8nWhatsAppWebhookUrl() {
  return getTrimmedEnv("N8N_WHATSAPP_WEBHOOK_URL") || getN8nWebhookUrl()
}

export function getN8nWhatsAppWebhookSecret() {
  return getTrimmedEnv("N8N_WHATSAPP_WEBHOOK_SECRET") || getTrimmedEnv("N8N_WEBHOOK_SECRET")
}

export function isN8nWhatsAppConfigured() {
  return Boolean(getN8nWhatsAppWebhookUrl())
}

async function postToWebhook<T = Record<string, unknown>>(
  webhookUrl: string | null,
  secret: string | null,
  payload: Record<string, unknown>,
  options?: { timeoutMs?: number },
) {
  if (!webhookUrl) return null

  const timeoutMs = options?.timeoutMs ?? 45000
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-clinvetia-n8n-secret": secret } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    })

    const data = (await response.json().catch(() => null)) as T | null

    return {
      ok: response.ok,
      status: response.status,
      data,
      error:
        !response.ok
          ? (typeof data === "object" &&
            data &&
            "error" in data &&
            typeof (data as { error?: unknown }).error === "string"
              ? (data as { error: string }).error
              : "N8N request failed")
          : null,
    }
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: null,
      error: error instanceof Error ? error.message : "N8N request failed",
    }
  } finally {
    clearTimeout(timeout)
  }
}

export async function callN8nWebhook<T = Record<string, unknown>>(
  payload: Record<string, unknown>,
  options?: { timeoutMs?: number },
) {
  return postToWebhook<T>(getN8nWebhookUrl(), getTrimmedEnv("N8N_WEBHOOK_SECRET"), payload, options)
}

export async function callN8nChatWebhook<T = Record<string, unknown>>(
  payload: Record<string, unknown>,
  options?: { timeoutMs?: number },
) {
  return postToWebhook<T>(getN8nChatWebhookUrl(), getN8nChatWebhookSecret(), payload, options)
}

export async function callN8nWhatsAppWebhook<T = Record<string, unknown>>(
  payload: Record<string, unknown>,
  options?: { timeoutMs?: number },
) {
  return postToWebhook<T>(getN8nWhatsAppWebhookUrl(), getN8nWhatsAppWebhookSecret(), payload, options)
}
