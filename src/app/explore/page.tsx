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

  // Aggregate all products across all creators
  const { data: allItems } = await admin
    .from("creator_items")
    .select(`
      id, category, custom_title, sort_order, is_pinned,
      creator_id,
      product:product_id (
        id, source_url, normalized_url, platform, item_id,
        title, agent_cached_price, is_oos
      ),
      images:product_images (
        id, url, is_qc
      )
    `)
    .order("sort_order", { ascending: true })
    .limit(200)

  const { data: clickCounts } = await admin
    .from("click_events")
    .select("product_id, creator_id")
    .limit(10000)

  const clickMap = new Map<string, number>()
  clickCounts?.forEach((e: any) => {
    const key = e.product_id
    clickMap.set(key, (clickMap.get(key) || 0) + 1)
  })

  const items = (allItems || []).map((item: any) => ({
    ...item,
    product: item.product || null,
    images: item.images || [],
    clickCount: clickMap.get(item.product?.id) || 0,
  }))

  // Sorting
  let sorted = [...items]
  if (sort === "trending") {
    sorted.sort((a, b) => b.clickCount - a.clickCount)
  } else if (sort === "newest") {
    sorted.reverse()
  }

  // Filtering
  let filtered = sorted
  if (q) {
    const query = q.toLowerCase()
    filtered = sorted.filter(
      (item: any) =>
        item.product?.title?.toLowerCase().includes(query) ||
        item.custom_title?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    )
  }
  if (category) {
    filtered = filtered.filter(
      (item: any) => item.category?.toLowerCase() === category.toLowerCase()
    )
  }

  // Dedup by product
  const seen = new Set<string>()
  const unique = filtered.filter((item: any) => {
    const key = item.product?.normalized_url || item.product?.source_url
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  const categories = [...new Set(items.map((i: any) => i.category).filter(Boolean))] as string[]
  const platformColors = { weidian: "#07C160", taobao: "#FF5000", "1688": "#FF6A00", dhgate: "#E53E3E" }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <a href="/" className="text-lg font-bold tracking-tight">QCBase</a>
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground">EXPLORE</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-xs text-muted-foreground hover:text-foreground">Login</a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <SearchBar
          defaultValue={q}
          categories={categories}
          selectedCategory={category}
        />

        {/* Sort Tabs */}
        <div className="mt-4 flex gap-4 border-b border-zinc-200 pb-2 dark:border-zinc-800">
          {[
            { key: "trending", label: "Trending" },
            { key: "newest", label: "Neu" },
            { key: "all", label: "Alle" },
          ].map((tab) => (
            <a
              key={tab.key}
              href={`?sort=${tab.key}${q ? `&q=${q}` : ""}${category ? `&category=${category}` : ""}`}
              className={`pb-2 text-xs font-medium transition-colors ${
                (sort || "trending") === tab.key
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        <div className="mt-6">
          {unique.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                {q ? `Keine Ergebnisse für "${q}"` : "Keine Produkte gefunden"}
              </p>
            </div>
          ) : (
            <ExploreGrid items={unique} />
          )}
        </div>
      </div>
    </div>
  )
}
