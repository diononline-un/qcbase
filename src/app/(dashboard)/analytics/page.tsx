import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { BarChart3, MousePointerClick, Eye } from "lucide-react"
import { TIER_LABELS } from "@/lib/tiers"
import type { Tier } from "@/lib/tiers"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", user.id)
    .single()

  const admin = createAdminClient()

  const { count: clickCount } = await admin
    .from("click_events")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", user.id)

  const { count: itemCount } = await admin
    .from("creator_items")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", user.id)

  const { count: productCount } = await admin
    .from("products")
    .select("*", { count: "exact", head: true })

  const tier = (profile?.tier || "free") as Tier

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          {TIER_LABELS[tier]} Tier – Übersicht deiner Performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Click-Outs</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{clickCount || 0}</p>
            <p className="text-xs text-muted-foreground">Gesamte Agent-Weiterleitungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deine Produkte</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{itemCount || 0}</p>
            <p className="text-xs text-muted-foreground">Gelistete Items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produkt-DB</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{productCount || 0}</p>
            <p className="text-xs text-muted-foreground">Produkte global gelistet</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Click-Out Verlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Die vollständige Analytics-Ansicht wird mit PostHog-Integration aktiviert.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
