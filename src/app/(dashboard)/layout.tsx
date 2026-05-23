import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar username={profile?.username || "User"} />
      <main className="flex-1 overflow-auto bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
