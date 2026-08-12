import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"

interface RecommendedSectionProps {
  productId: string
  creatorId: string
  platform: string | null
  category: string | null
  weights: Record<string, number>
  creatorSlug: string
  tier: string
  affiliateCodes: Record<string, string>
}

export async function RecommendedSection({
  productId,
  creatorId,
  platform,
  category,
  weights,
  creatorSlug,
}: RecommendedSectionProps) {
  const admin = createAdminClient()

  const { data: allItems } = await admin
    .from("creator_items")
    .select("id, product_id, category")
    .eq("creator_id", creatorId)

  if (!allItems || allItems.length <= 1) return null

  const otherItems = allItems.filter((i: any) => i.product_id !== productId)
  if (otherItems.length === 0) return null

  const productIds = otherItems.map((i: any) => i.product_id)
  const { data: products } = await admin
    .from("products")
    .select("id, title, platform, agent_cached_price, is_oos")
    .in("id", productIds)

  if (!products || products.length === 0) return null

  const productMap = new Map<string, any>()
  products.forEach((p: any) => productMap.set(p.id, p))

  const categoryMap = new Map<string, string>()
  otherItems.forEach((i: any) => { if (i.product_id) categoryMap.set(i.product_id, i.category) })

  const { data: clickData } = await admin
    .from("click_events")
    .select("product_id")
    .eq("creator_id", creatorId)

  const clickCounts = new Map<string, number>()
  clickData?.forEach((c: any) => {
    clickCounts.set(c.product_id, (clickCounts.get(c.product_id) || 0) + 1)
  })

  const maxClicks = Math.max(1, ...clickCounts.values())

  const scored = otherItems
    .filter((i: any) => productMap.has(i.product_id))
    .map((i: any) => {
      const p = productMap.get(i.product_id)
      const itemCategory = categoryMap.get(i.product_id) || ""
      let score = 0

      if (category && itemCategory === category) {
        score += weights.category_bias || 0.3
      }
      if (platform && p.platform === platform) {
        score += weights.brand_bias || 0.2
      }
      if (clickCounts.has(i.product_id)) {
        score += (clickCounts.get(i.product_id)! / maxClicks) * (weights.ctr_bias || 0.2)
      }
      if (p.agent_cached_price) {
        const priceScore = Math.min(Number(p.agent_cached_price) / 200, 1) * (weights.price_bias || 0.3)
        score += priceScore
      }

      return { ...i, product: p, score }
    })
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 8)

  if (scored.length === 0) return null

  const { data: allImages } = await admin
    .from("product_images")
    .select("product_id, url, is_qc, dominant_color")
    .in("product_id", scored.map((s: any) => s.product_id))

  const imagesByProduct = new Map<string, any[]>()
  allImages?.forEach((img: any) => {
    const arr = imagesByProduct.get(img.product_id) || []
    arr.push(img)
    imagesByProduct.set(img.product_id, arr)
  })

  return (
    <section className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-700">
      <h2 className="mb-6 font-mono text-sm uppercase tracking-wider">Recommended</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {scored.map((item: any) => {
          const product = item.product
          const imgs = imagesByProduct.get(product.id) || []
          const thumbnail = imgs.find((img: any) => !img.is_qc)?.url || imgs[0]?.url
          const qcImage = imgs.find((img: any) => img.is_qc)?.url
          const price = product.agent_cached_price

          return (
            <Link
              key={item.id}
              href={`/${creatorSlug}/product/${product.id}`}
              className={`group block ${product.is_oos ? "opacity-40" : ""}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {thumbnail ? (
                  <div className="relative h-full w-full">
                    <img
                      src={thumbnail}
                      alt={product.title || ""}
                      className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-0"
                      loading="lazy"
                    />
                    {qcImage && (
                      <img
                        src={qcImage}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        loading="lazy"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="px-0.5 py-2">
                <p className="line-clamp-2 text-xs font-medium leading-tight">
                  {product.title || "Product"}
                </p>
                {price !== null && (
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    ~{Number(price).toFixed(2).replace(".", ",")} €
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
