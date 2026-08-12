import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { BarChart3, MousePointerClick, Eye, TrendingUp } from "lucide-react"
import { TIER_LABELS } from "@/lib/tiers"
import type { Tier } from "@/lib/tiers"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("user_accounts")
    .select("tier")
    .eq("id", user.id)
    .single()

  const admin = createAdminClient()
  const tier = (profile?.tier || "free") as Tier

  // Fetch click events for this creator
  const { data: clicks } = await admin
    .from("click_events")
    .select("id, agent_id, product_id")
    .eq("creator_id", user.id)
    .limit(1000)

  const clickCount = (clicks || []).length

  // Agent distribution
  const agentMap = new Map<string, number>()
  clicks?.forEach((c: any) => {
    agentMap.set(c.agent_id, (agentMap.get(c.agent_id) || 0) + 1)
  })
  const topAgents = [...agentMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Product stats
  const { data: items } = await admin
    .from("creator_items")
    .select("id, product_id")
    .eq("creator_id", user.id)

  const itemCount = (items || []).length

  // Top products by clicks
  const productClickMap = new Map<string, number>()
  clicks?.forEach((c: any) => {
    productClickMap.set(c.product_id, (productClickMap.get(c.product_id) || 0) + 1)
  })

  const productMap = new Map<string, any>()
  if ((items || []).length > 0) {
    const { data: products } = await admin
      .from("products")
      .select("id, title")
      .limit(500)
    products?.forEach((p: any) => productMap.set(p.id, p))
  }

  const topProducts = [...productClickMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId, count]) => ({
      title: productMap.get(productId)?.title || productId.slice(0, 8),
      count,
    }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          {TIER_LABELS[tier]} Tier
        </p>
        <p className="text-xs text-muted-foreground">
          All time
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Click-Outs</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{clickCount}</p>
            <p className="text-xs text-muted-foreground">Agent-Weiterleitungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produkte</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{itemCount}</p>
            <p className="text-xs text-muted-foreground">Gelistete Items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {itemCount > 0 ? (clickCount / itemCount).toFixed(1) : 0}
            </p>
            <p className="text-xs text-muted-foreground">Clicks / Produkte</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Agenten</CardTitle>
          </CardHeader>
          <CardContent>
            {topAgents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Daten</p>
            ) : (
              <div className="space-y-2">
                {topAgents.map(([agent, count]) => (
                  <div key={agent} className="flex items-center justify-between">
                    <span className="text-sm font-mono">{agent}</span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Produkte</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Daten</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map(({ title, count }, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="line-clamp-1 text-sm">{title}</span>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
