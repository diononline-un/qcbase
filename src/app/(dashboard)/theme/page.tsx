import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { updateCreatorSettings } from "@/lib/actions/profile"

export default async function ThemePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const admin = createAdminClient()
  const { data: settings } = await admin
    .from("creator_settings")
    .select("*")
    .eq("creator_id", user.id)
    .single()

  const theme = (settings?.theme as Record<string, any>) || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Theme</h1>
        <p className="text-sm text-muted-foreground">
          Passe das Aussehen deines Creator Hubs an
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Farben</CardTitle>
            <CardDescription>Akzent- und Hintergrundfarbe</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                "use server"
                const primaryColor = formData.get("primaryColor") as string
                const backgroundColor = formData.get("backgroundColor") as string

                await updateCreatorSettings({
                  theme: {
                    primaryColor: primaryColor || "#000000",
                    backgroundColor: backgroundColor || "#0F0F0F",
                  },
                })
                revalidatePath("/theme")
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Akzentfarbe</Label>
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-md border"
                    style={{ backgroundColor: theme.primaryColor || "#000000" }}
                  />
                  <Input
                    id="primaryColor"
                    name="primaryColor"
                    defaultValue={theme.primaryColor || "#000000"}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Hintergrundfarbe</Label>
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-md border"
                    style={{ backgroundColor: theme.backgroundColor || "#0F0F0F" }}
                  />
                  <Input
                    id="backgroundColor"
                    name="backgroundColor"
                    defaultValue={theme.backgroundColor || "#0F0F0F"}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <Button type="submit" size="sm">
                Speichern
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banner</CardTitle>
            <CardDescription>Header-Bild für deinen Hub</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                "use server"
                const bannerUrl = formData.get("bannerUrl") as string
                await updateCreatorSettings({ bannerUrl: bannerUrl || undefined })
                revalidatePath("/theme")
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="bannerUrl">Banner Bild-URL</Label>
                <Input
                  id="bannerUrl"
                  name="bannerUrl"
                  defaultValue={settings?.banner_url || ""}
                  placeholder="https://..."
                />
              </div>
              {settings?.banner_url && (
                <div className="h-24 overflow-hidden rounded-lg">
                  <img
                    src={settings.banner_url}
                    alt="Banner preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
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
