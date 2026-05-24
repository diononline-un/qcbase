import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { deleteSessionToken } from "@/lib/auth/auth"

export async function POST() {
  const c = await cookies()
  const token = c.get("session")?.value

  if (token) {
    await deleteSessionToken(token)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set("session", "", { maxAge: 0, path: "/" })
  return response
}
