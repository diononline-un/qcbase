"use server"

import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) return null

  const admin = createAdminClient()
  const { data: session } = await admin
    .from("user_sessions")
    .select("user_id")
    .eq("token", token)
    .single()

  if (!session) return null

  const { data: user } = await admin
    .from("user_accounts")
    .select("id, username, role, tier")
    .eq("id", session.user_id)
    .single()

  return user || null
}
