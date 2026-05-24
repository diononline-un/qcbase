import { cookies } from "next/headers"
import { getUserBySessionToken } from "@/lib/auth/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function createClient() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  return {
    auth: {
      getUser: async () => {
        if (!token) return { data: { user: null }, error: null }
        const user = await getUserBySessionToken(token)
        return {
          data: {
            user: user ? {
              id: user.id,
              email: user.email,
              user_metadata: { username: user.username },
            } : null,
          },
          error: null,
        }
      },
    },
    from: (table: string) => {
      const admin = createAdminClient()
      return admin.from(table)
    },
  }
}
