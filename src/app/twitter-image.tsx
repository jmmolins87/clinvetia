import { ImageResponse } from "next/og"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          backgroundColor: "#060910",
          backgroundImage:
            "radial-gradient(circle at 18% 24%, rgba(67,233,123,0.2), transparent 42%), radial-gradient(circle at 78% 12%, rgba(0,242,254,0.2), transparent 44%)",
          color: "#eaf5f2",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#43e97b",
              boxShadow: "0 0 20px rgba(67,233,123,0.8)",
            }}
          />
          <span style={{ fontSize: 34, fontWeight: 700 }}>Clinvetia</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 940 }}>
          <span style={{ fontSize: 72, lineHeight: 1.04, fontWeight: 800 }}>
            IA para clínicas veterinarias
          </span>
          <span style={{ fontSize: 34, lineHeight: 1.25, color: "#b6cbc4" }}>
            Menos carga operativa, más tiempo para tus pacientes.
          </span>
        </div>
        <div style={{ fontSize: 26, color: "#9bc0b4" }}>clinvetia.com</div>
      </div>
    ),
    size,
  )
}
