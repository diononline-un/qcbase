import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
import { CreatorBanner } from "@/components/hub/creator-banner"
import { ProductGrid } from "@/components/hub/product-grid"
import { SearchBar } from "@/components/hub/search-bar"
import { notFound } from "next/navigation"

interface CreatorHubPageProps {
  params: Promise<{ creator: string }>
  searchParams: Promise<{ q?: string; category?: string }>
}

export async function generateMetadata({ params }: CreatorHubPageProps): Promise<Metadata> {
  const { creator } = await params
  return {
    title: `${creator} – QCBase`,
    description: `${creator}s Proxy-Shopping Hub – Finde die besten Deals`,
  }
}

export default async function CreatorHubPage({ params, searchParams }: CreatorHubPageProps) {
  const { creator: creatorSlug } = await params
  const { q, category } = await searchParams

  const admin = createAdminClient()

  const { data: settings } = await admin
    .from("creator_settings")
    .select("creator_id, theme, banner_url, affiliate_codes")
    .eq("subdomain", creatorSlug)
    .single()

  if (!settings) {
    notFound()
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id, username, role, tier, avatar_url")
    .eq("id", settings.creator_id)
    .single()

  if (!profile) {
    notFound()
  }

  const { data: creatorItems } = await admin
    .from("creator_items")
    .select(`
      id, category, custom_title, sort_order, is_pinned,
      product:product_id (
        id, source_url, normalized_url, platform, item_id,
        title, agent_cached_price, is_oos
      ),
      images:product_images (
        id, url, is_qc
      )
    `)
    .eq("creator_id", settings.creator_id)
    .order("is_pinned", { ascending: false })
    .order("sort_order", { ascending: true })

  const items = (creatorItems || []).map((item: any) => ({
    ...item,
    product: item.product || null,
    images: item.images || [],
  }))

  // Filter by search query
  let filteredItems = items
  if (q) {
    const query = q.toLowerCase()
    filteredItems = items.filter(
      (item: any) =>
        item.product?.title?.toLowerCase().includes(query) ||
        item.custom_title?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    )
  }
  if (category) {
    filteredItems = filteredItems.filter(
      (item: any) => item.category?.toLowerCase() === category.toLowerCase()
    )
  }

  // Get unique categories
  const categories = [...new Set(items.map((i: any) => i.category).filter(Boolean))] as string[]

  const theme = (settings.theme as any) || {}
  const affiliateCodes = (settings.affiliate_codes as Record<string, string>) || {}

  return (
    <div className="min-h-screen bg-background">
      <CreatorBanner
        creator={profile}
        settings={settings}
        theme={theme}
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <SearchBar
          defaultValue={q}
          categories={categories}
          selectedCategory={category}
        />
        <div className="mt-8">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                {q ? `Keine Ergebnisse für "${q}"` : "Noch keine Produkte vorhanden"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {q ? "Versuche einen anderen Suchbegriff" : "Der Creator hat noch keine Produkte hinzugefügt"}
              </p>
            </div>
          ) : (
            <ProductGrid
              items={filteredItems}
              creatorId={profile.id}
              creatorSlug={creatorSlug}
              affiliateCodes={affiliateCodes}
              theme={theme}
            />
          )}
        </div>
      </div>
    </div>
  )
}
