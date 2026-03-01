export type RecaptchaVerifyResult = {
  ok: boolean
  reason?: string
  score?: number
}

type RecaptchaResponse = {
  success: boolean
  score?: number
  action?: string
  "error-codes"?: string[]
}

type RecaptchaEnterpriseResponse = {
  tokenProperties?: {
    valid?: boolean
    invalidReason?: string
    action?: string
  }
  riskAnalysis?: {
    score?: number
    reasons?: string[]
  }
}

export async function verifyRecaptchaToken(params: {
  token?: string
  action: string
  minScore?: number
  ip?: string | null
}): Promise<RecaptchaVerifyResult> {
  const { token, action, minScore = 0.5, ip } = params
  if (!token) {
    return { ok: false, reason: "Missing reCAPTCHA token" }
  }

  const projectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID
  const apiKey = process.env.RECAPTCHA_ENTERPRISE_API_KEY
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const secret = process.env.RECAPTCHA_SECRET_KEY

  const verifyLegacy = async (): Promise<RecaptchaVerifyResult> => {
    if (!secret) {
      if (process.env.NODE_ENV === "production") {
        return { ok: false, reason: "Missing reCAPTCHA credentials" }
      }
      return { ok: true, reason: "recaptcha-dev-bypass", score: 1 }
    }

    const form = new URLSearchParams()
    form.set("secret", secret)
    form.set("response", token)
    if (ip) form.set("remoteip", ip)

    let response: RecaptchaResponse | null = null
    try {
      const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
        cache: "no-store",
      })
      response = (await res.json()) as RecaptchaResponse
    } catch {
      return { ok: false, reason: "reCAPTCHA verification failed" }
    }

    if (!response?.success) {
      return {
        ok: false,
        reason: response?.["error-codes"]?.join(", ") || "Invalid reCAPTCHA",
        score: response?.score,
      }
    }

    if (response.action && response.action !== action) {
      return { ok: false, reason: "Invalid reCAPTCHA action", score: response.score }
    }

    if (typeof response.score === "number" && response.score < minScore) {
      return { ok: false, reason: "Low reCAPTCHA score", score: response.score }
    }

    return { ok: true, score: response.score }
  }

  if (projectId && apiKey && siteKey) {
    let response: RecaptchaEnterpriseResponse | null = null
    try {
      const res = await fetch(
        `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/assessments?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: {
              token,
              siteKey,
              expectedAction: action,
              userIpAddress: ip || undefined,
            },
          }),
          cache: "no-store",
        },
      )
      if (!res.ok) {
        return verifyLegacy()
      }
      response = (await res.json()) as RecaptchaEnterpriseResponse
    } catch {
      return verifyLegacy()
    }

    if (!response?.tokenProperties?.valid) {
      return {
        ok: false,
        reason: response?.tokenProperties?.invalidReason || "Invalid reCAPTCHA token",
        score: response?.riskAnalysis?.score,
      }
    }

    if (response?.tokenProperties?.action && response.tokenProperties.action !== action) {
      return { ok: false, reason: "Invalid reCAPTCHA action", score: response?.riskAnalysis?.score }
    }

    const score = response?.riskAnalysis?.score
    if (typeof score === "number" && score < minScore) {
      return { ok: false, reason: "Low reCAPTCHA score", score }
    }

    return { ok: true, score }
  }

  return verifyLegacy()
}
