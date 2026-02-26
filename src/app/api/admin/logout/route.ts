import { NextResponse } from "next/server"
import { AdminSession } from "@/models/AdminSession"
import { dbConnect } from "@/lib/db"
import { getAdminCookieName } from "@/lib/admin-auth"

function getCookie(req: Request, name: string) {
  const header = req.headers.get("cookie")
  if (!header) return null
  const parts = header.split(";")
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=")
    if (k === name) return decodeURIComponent(rest.join("="))
  }
  return null
}

export async function POST(req: Request) {
  const cookieName = getAdminCookieName()
  const token = getCookie(req, cookieName)
  if (token) {
    await dbConnect()
    await AdminSession.deleteOne({ token })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  })

  return res
}
