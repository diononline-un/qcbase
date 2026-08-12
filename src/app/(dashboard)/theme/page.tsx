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
  const primaryColor = (theme.primaryColor as string) || "#000000"
  const backgroundColor = (theme.backgroundColor as string) || "#0F0F0F"

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
                const primaryColorVal = formData.get("primaryColor") as string
                const backgroundColorVal = formData.get("backgroundColor") as string

                await updateCreatorSettings({
                  theme: {
                    primaryColor: primaryColorVal || "#000000",
                    backgroundColor: backgroundColorVal || "#0F0F0F",
                  },
                })
                revalidatePath("/theme")
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Akzentfarbe</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    defaultValue={primaryColor}
                    className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent"
                  />
                  <code className="font-mono text-sm text-zinc-400">{primaryColor}</code>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Hintergrundfarbe</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="backgroundColor"
                    name="backgroundColor"
                    defaultValue={backgroundColor}
                    className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent"
                  />
                  <code className="font-mono text-sm text-zinc-400">{backgroundColor}</code>
                </div>
              </div>

              <Button type="submit" size="sm">
                Speichern
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vorschau</CardTitle>
              <CardDescription>Live-Vorschau der Farben</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="mx-auto max-w-xs space-y-3 rounded-lg p-6"
                style={{ backgroundColor }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="font-mono text-xs" style={{ color: primaryColor }}>
                    ACCENT
                  </span>
                </div>
                <div
                  className="rounded-md px-3 py-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <p className="text-center font-mono text-xs text-white">
                    Button
                  </p>
                </div>
                <div className="flex gap-1">
                  {[0.3, 0.2, 0.4, 0.15].map((w, i) => (
                    <div
                      key={i}
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: primaryColor,
                        opacity: 1 - w,
                        width: `${(1 - w) * 100}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
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
    </div>
  )
}
