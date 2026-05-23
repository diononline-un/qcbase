import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"
import { TIER_LABELS, TIER_DESCRIPTIONS, TIER_FEATURES } from "@/lib/tiers"
import type { Tier } from "@/lib/tiers"
import { Check, ArrowRight } from "lucide-react"

const TIERS: Tier[] = ["free", "creator", "creator_plus", "reseller"]

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", user.id)
    .single()

  const currentTier = (profile?.tier || "free") as Tier

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Aktueller Plan: {TIER_LABELS[currentTier]}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => {
          const isCurrent = tier === currentTier
          const features = TIER_FEATURES[tier]

          return (
            <Card key={tier} className={isCurrent ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {TIER_LABELS[tier]}
                  {isCurrent && (
                    <Badge variant="secondary" className="text-[10px]">
                      Aktiv
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{TIER_DESCRIPTIONS[tier]}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {features.slice(0, 5).map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-primary" />
                      {feat.replace(/_/g, " ")}
                    </li>
                  ))}
                  {features.length > 5 && (
                    <li className="text-xs text-muted-foreground">
                      +{features.length - 5} weitere Features
                    </li>
                  )}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Aktueller Plan
                  </Button>
                ) : (
                  <Button className="w-full gap-1" variant={tier === "creator_plus" ? "default" : "outline"}>
                    Upgrade <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
