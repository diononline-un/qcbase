"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function updateProfile(data: {
  username?: string
  avatarUrl?: string
}): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const admin = createAdminClient()
  const { error } = await admin
    .from("profiles")
    .update({
      username: data.username,
      avatar_url: data.avatarUrl,
    })
    .eq("id", user.id)

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const admin = createAdminClient()
  const { error } = await admin
    .from("creator_settings")
    .upsert({
      creator_id: user.id,
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
