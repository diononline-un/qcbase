import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation"
import { ExternalLink, Plus, Search } from "lucide-react"
import { addProduct, linkToCreator } from "@/lib/actions/products"
import { scrapeImagesAction } from "@/lib/actions/scrape-images"
import { revalidatePath } from "next/cache"

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { q } = await searchParams
  const admin = createAdminClient()

  const { data: items } = await admin
    .from("creator_items")
    .select(`
      id, category, custom_title, is_pinned,
      product:product_id (
        id, source_url, platform, title, agent_cached_price, is_oos, normalized_url
      )
    `)
    .eq("creator_id", user.id)
    .order("is_pinned", { ascending: false })

  const filteredItems = q
    ? items?.filter(
        (item: any) =>
          item.product?.title?.toLowerCase().includes(q.toLowerCase()) ||
          item.custom_title?.toLowerCase().includes(q.toLowerCase())
      )
    : items

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Links</h1>
          <p className="text-sm text-muted-foreground">
            Verwalte deine Produkt-Links ({items?.length || 0})
          </p>
        </div>
        <AddProductForm userId={user.id} />
      </div>

      <div className="flex gap-3">
        <form className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Produkte durchsuchen..."
              defaultValue={q}
              className="pl-10"
            />
          </div>
        </form>
      </div>

      <div className="grid gap-3">
        {filteredItems?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {q ? "Keine Ergebnisse gefunden" : "Noch keine Produkte hinzugefügt"}
              </p>
            </CardContent>
          </Card>
        )}

        {filteredItems?.map((item: any) => (
          <Card key={item.id} className="hover:bg-muted/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {item.custom_title || item.product?.title || "Unbenannt"}
                  </p>
                  {item.is_pinned && (
                    <Badge variant="secondary" className="text-[10px]">Pinned</Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {item.product?.platform || "unknown"}
                  </Badge>
                  {item.product?.agent_cached_price && (
                    <span className="text-xs text-muted-foreground">
                      ~{item.product.agent_cached_price.toFixed(2)} €
                    </span>
                  )}
                  {item.product?.is_oos && (
                    <Badge variant="destructive" className="text-[10px]">OOS</Badge>
                  )}
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {item.product?.source_url}
                </p>
              </div>
              <a
                href={item.product?.source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <form action={scrapeImagesAction.bind(null, item.product?.source_url)}>
                <Button variant="ghost" size="icon" className="h-8 w-8" type="submit" title="Bilder scrapen">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AddProductForm({ userId }: { userId: string }) {
  return (
    <form
      action={async (formData: FormData) => {
        "use server"
        const url = formData.get("url") as string
        if (!url) return

        const { productId } = await addProduct(url)
        await linkToCreator(userId, productId)
        revalidatePath("/links")
      }}
      className="flex gap-2"
    >
      <Input
        name="url"
        placeholder="Weidian/Taobao/1688 URL..."
        className="w-72"
        required
      />
      <Button type="submit" size="sm">
        <Plus className="mr-1 h-4 w-4" />
        Hinzufügen
      </Button>
    </form>
  )
}
