import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getUserBySessionToken } from "@/lib/auth/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const c = await cookies()
  const token = c.get("session")?.value
  if (!token) redirect("/login")

  const user = await getUserBySessionToken(token)
  if (!user) redirect("/login")

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <DashboardSidebar username={user.username || "User"} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
