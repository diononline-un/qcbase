import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { updateCreatorSettings } from "@/lib/actions/profile"
import { TIER_LABELS } from "@/lib/tiers"
import type { Tier } from "@/lib/tiers"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("user_accounts")
    .select("username, tier")
    .eq("id", user.id)
    .single()

  const { data: settings } = await admin
    .from("creator_settings")
    .select("*")
    .eq("creator_id", user.id)
    .single()

  const tier = (profile?.tier || "free") as Tier
  const affiliateCodes = (settings?.affiliate_codes as Record<string, string>) || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          {TIER_LABELS[tier]} Plan
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Benutzername und Subdomain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Benutzername</Label>
              <Input defaultValue={profile?.username || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Subdomain</Label>
              <Input
                defaultValue={settings?.subdomain || ""}
                readOnly
                placeholder="deinname"
              />
              <p className="text-xs text-muted-foreground">
                deinname.qcbase.site
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Affiliate Codes</CardTitle>
            <CardDescription>Füge deine Agent-Affiliate-Codes hinzu</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                "use server"
                const codes: Record<string, string> = {}
                formData.forEach((value, key) => {
                  if (value) codes[key] = value as string
                })
                await updateCreatorSettings({ affiliateCodes: codes })
                revalidatePath("/settings")
              }}
              className="space-y-3"
            >
              {["litbuy", "oopbuy", "hipobuy", "acbuy", "gtbuy", "usfans",
                "kakobuy", "cssbuy", "cnfans", "superbuy", "lovegobuy"].map((agent) => (
                <div key={agent} className="space-y-1">
                  <Label htmlFor={agent} className="text-xs">
                    {agent.charAt(0).toUpperCase() + agent.slice(1)}
                  </Label>
                  <Input
                    id={agent}
                    name={agent}
                    defaultValue={affiliateCodes[agent] || ""}
                    placeholder="Dein Affiliate-Code"
                    className="h-8 text-xs"
                  />
                </div>
              ))}
              <Button type="submit" size="sm">
                Speichern
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
