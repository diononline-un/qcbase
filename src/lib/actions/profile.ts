"use server"

import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { getUserBySessionToken } from "@/lib/auth/auth"

async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) return null
  const user = await getUserBySessionToken(token)
  return user?.id || null
}

export async function updateProfile(data: {
  username?: string
  avatarUrl?: string
}): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error("Not authenticated")

  const admin = createAdminClient()
  const { error } = await admin
    .from("user_accounts")
    .update({
      username: data.username,
      avatar_url: data.avatarUrl,
    })
    .eq("id", userId)

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }
}

export async function updateCreatorSettings(data: {
  subdomain?: string
  customDomain?: string
  theme?: Record<string, any>
  bannerUrl?: string
  affiliateCodes?: Record<string, string>
}): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error("Not authenticated")

  const admin = createAdminClient()
  const { error } = await admin
    .from("creator_settings")
    .upsert({
      creator_id: userId,
      subdomain: data.subdomain,
      custom_domain: data.customDomain,
      theme: data.theme || {},
      banner_url: data.bannerUrl,
      affiliate_codes: data.affiliateCodes || {},
    })

  if (error) {
    throw new Error(`Failed to update settings: ${error.message}`)
  }
}
