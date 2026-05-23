import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
import { ExploreGrid } from "@/components/explore/explore-grid"
import { SearchBar } from "@/components/hub/search-bar"

export const metadata: Metadata = {
  title: "Explore – QCBase",
  description: "Entdecke die besten Proxy-Shopping Produkte aller Creators",
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>
}) {
  const { q, category, sort } = await searchParams

  const admin = createAdminClient()

  const { data: allItems } = await admin
    .from("creator_items")
    .select("id, category, custom_title, sort_order, is_pinned, creator_id, product_id")
    .limit(100)

  const productMap = new Map<string, any>()
  if ((allItems || []).length > 0) {
    const { data: products } = await admin
      .from("products")
      .select("id, source_url, normalized_url, platform, item_id, title, agent_cached_price, is_oos")
      .limit(500)
    products?.forEach((p: any) => productMap.set(p.id, p))
  }

  const items = (allItems || []).map((item: any) => ({
    ...item,
    product: productMap.get(item.product_id) || null,
    images: [] as any[],
    clickCount: 0,
  }))

  let sorted = [...items]
  if (sort === "newest") sorted.reverse()

  let filtered = sorted
  if (q) {
    const query = q.toLowerCase()
    filtered = sorted.filter((item: any) =>
      item.product?.title?.toLowerCase().includes(query) ||
      item.custom_title?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    )
  }
  if (category) {
    filtered = filtered.filter((item: any) => item.category?.toLowerCase() === category.toLowerCase())
  }

  const seen = new Set<string>()
  const unique = filtered.filter((item: any) => {
    const key = item.product?.normalized_url || item.product?.source_url
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  const categories = [...new Set(items.map((i: any) => i.category).filter(Boolean))] as string[]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <a href="/" className="text-lg font-bold tracking-tight">QCBase</a>
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground">EXPLORE</span>
          </div>
          <a href="/login" className="text-xs text-muted-foreground hover:text-foreground">Login</a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <SearchBar defaultValue={q} categories={categories} selectedCategory={category} />

        <div className="mt-4 flex gap-4 border-b border-zinc-200 pb-2 dark:border-zinc-800">
          {[{ key: "trending", label: "Trending" }, { key: "newest", label: "Neu" }].map((tab) => (
            <a
              key={tab.key}
              href={`?sort=${tab.key}`}
              className={`pb-2 text-xs font-medium transition-colors ${(sort || "trending") === tab.key ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        <div className="mt-6">
          {unique.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium text-muted-foreground">Keine Produkte gefunden</p>
            </div>
          ) : (
            <ExploreGrid items={unique} />
          )}
        </div>
      </div>
    </div>
  )
}
