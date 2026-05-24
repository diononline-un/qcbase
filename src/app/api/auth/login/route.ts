import { NextResponse } from "next/server"
import { authenticateUser, createSessionToken } from "@/lib/auth/auth"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }

  const user = await authenticateUser(email, password)

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const token = await createSessionToken(user.id)

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, username: user.username, role: user.role, tier: user.tier },
    redirect: "/",
  })

  response.cookies.set("session", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  })

  return response
}
