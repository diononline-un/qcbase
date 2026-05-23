import { createClient } from "@supabase/supabase-js"

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
