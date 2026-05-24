import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
import { ProductGrid } from "@/components/hub/product-grid"
import { notFound } from "next/navigation"
import { CreatorHubHeader } from "@/components/hub/creator-hub-header"

export const dynamic = "force-dynamic"

interface CreatorHubPageProps {
  params: Promise<{ creator: string }>
  searchParams: Promise<{ q?: string; category?: string }>
}

export async function generateMetadata({ params }: CreatorHubPageProps): Promise<Metadata> {
  const { creator } = await params
  return { title: `${creator} – QCBase`, description: `${creator}s Proxy-Shopping Hub` }
}

export default async function CreatorHubPage({ params, searchParams }: CreatorHubPageProps) {
  const { creator: creatorSlug } = await params
  const { q, category } = await searchParams
  const admin = createAdminClient()

  const { data: settings } = await admin
    .from("creator_settings")
    .select("creator_id, theme, affiliate_codes")
    .eq("subdomain", creatorSlug)
    .single()

  if (!settings) notFound()

  const { data: profile } = await admin
    .from("profiles")
    .select("id, username, role, tier, avatar_url")
    .eq("id", settings.creator_id)
    .single()

  if (!profile) notFound()

  const { data: creatorItems } = await admin
    .from("creator_items")
    .select("id, category, custom_title, sort_order, is_pinned, product_id")
    .eq("creator_id", settings.creator_id)
    .order("is_pinned", { ascending: false })
    .order("sort_order", { ascending: true })

  const { data: allProducts } = await admin.from("products").select("id, source_url, normalized_url, platform, item_id, title, agent_cached_price, is_oos")
  const { data: allImages } = await admin.from("product_images").select("id, product_id, url, is_qc")

  const productMap = new Map<string, any>()
  allProducts?.forEach((p: any) => productMap.set(p.id, p))
  const imageMap = new Map<string, any[]>()
  allImages?.forEach((img: any) => {
    if (!imageMap.has(img.product_id)) imageMap.set(img.product_id, [])
    imageMap.get(img.product_id)!.push(img)
  })

  const items = (creatorItems || []).map((item: any) => ({
    ...item,
    product: productMap.get(item.product_id) || null,
    images: imageMap.get(item.product_id) || [],
  }))

  let filteredItems = items
  if (q) {
    const query = q.toLowerCase()
    filteredItems = items.filter((item: any) =>
      item.product?.title?.toLowerCase().includes(query) ||
      item.custom_title?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    )
  }
  if (category) {
    filteredItems = filteredItems.filter((item: any) => item.category?.toLowerCase() === category.toLowerCase())
  }

  const categories = [...new Set(items.map((i: any) => i.category).filter(Boolean))] as string[]
  const theme = (settings.theme as any) || {}
  const affiliateCodes = (settings.affiliate_codes as Record<string, string>) || {}

  return (
    <div className="min-h-screen bg-background">
      <CreatorHubHeader
        creator={profile}
        categories={categories}
        selectedCategory={category}
        defaultValue={q}
        accentColor={theme.primaryColor}
      />
      <div className="mx-auto max-w-7xl px-4 pt-4 pb-8">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              {q ? `NO RESULTS FOR "${q}"` : "NO PRODUCTS YET"}
            </p>
          </div>
        ) : (
          <ProductGrid
            items={filteredItems}
            creatorId={profile.id}
            creatorSlug={creatorSlug}
            affiliateCodes={affiliateCodes}
            theme={theme}
            tier={profile.tier}
          />
        )}
      </div>
    </div>
  )
}
