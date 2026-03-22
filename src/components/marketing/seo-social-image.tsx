import { ImageResponse } from "next/og"

export const socialImageSize = {
  width: 1200,
  height: 630,
}

export const socialImageContentType = "image/png"

export interface SeoSocialImageOptions {
  eyebrow: string
  title: string
  description: string
  footerLabel?: string
}

export function createSeoSocialImage({
  eyebrow,
  title,
  description,
  footerLabel,
}: SeoSocialImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px",
          backgroundColor: "#050810",
          backgroundImage:
            "radial-gradient(circle at 18% 20%, rgba(67,233,123,0.24), transparent 38%), radial-gradient(circle at 82% 14%, rgba(0,242,254,0.22), transparent 42%), linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
          color: "#ecf8f3",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "#43e97b",
                boxShadow: "0 0 20px rgba(67,233,123,0.7)",
              }}
            />
            <span style={{ fontSize: 34, fontWeight: 700 }}>Clinvetia</span>
          </div>
          <div
            style={{
              display: "flex",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.05)",
              padding: "12px 20px",
              fontSize: 20,
              color: "#b9dad0",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 980 }}>
          <span style={{ fontSize: 66, lineHeight: 1.03, fontWeight: 800 }}>{title}</span>
          <span style={{ fontSize: 31, lineHeight: 1.28, color: "#b7cdc5" }}>{description}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#97bdb0",
          }}
        >
          <span>{footerLabel ?? eyebrow}</span>
          <span>clinvetia.com</span>
        </div>
      </div>
    ),
    socialImageSize,
  )
}
