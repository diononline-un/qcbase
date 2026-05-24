"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { parseSourceUrl } from "@/lib/parser"
import { revalidatePath } from "next/cache"

export async function addProduct(sourceUrl: string): Promise<{ productId: string; isNew: boolean }> {
  const parsed = parseSourceUrl(sourceUrl)
  const normalizedUrl = parsed?.normalizedUrl || sourceUrl

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from("products")
    .select("id")
    .eq("normalized_url", normalizedUrl)
    .single()

  if (existing) {
    return { productId: existing.id, isNew: false }
  }

  const { data: product, error } = await admin
    .from("products")
    .insert({
      source_url: sourceUrl,
      normalized_url: normalizedUrl,
      platform: parsed?.platform || null,
      item_id: parsed?.itemId || null,
    })
    .select("id")
    .single()

  if (error) {
    throw new Error(`Failed to add product: ${error.message}`)
  }

  // Fire-and-forget: scrape images in background
  import("@/lib/scraping/image-scraper").then(({ scrapeProductImages }) => {
      scrapeProductImages(sourceUrl).then(async (result) => {
        if (result.success && result.images.length > 0) {
          const admin = createAdminClient()
          if (result.title) {
            await admin.from("products").update({ title: result.title }).eq("id", product.id)
          }
          for (let i = 0; i < result.images.length; i++) {
            try {
              await admin.from("product_images").upsert(
                { product_id: product.id, url: result.images[i], is_qc: false, order: i },
                { onConflict: "product_id,url" }
              )
            } catch {}
          }
        }
      }).catch(() => {})
  })

  return { productId: product.id, isNew: true }
}

export async function linkToCreator(
  creatorId: string,
  productId: string,
  category?: string
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== creatorId) {
    throw new Error("Unauthorized")
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("creator_items")
    .upsert({
      creator_id: creatorId,
      product_id: productId,
      category: category || null,
    }, {
      onConflict: "creator_id,product_id",
    })

  if (error) {
    throw new Error(`Failed to link product: ${error.message}`)
  }

  revalidatePath(`/${creatorId}`)
}

export async function getCreatorItems(
  creatorId: string,
  opts: { page?: number; limit?: number; search?: string } = {}
) {
  const admin = createAdminClient()
  const { page = 1, limit = 20, search } = opts

  let query = admin
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
    `, { count: "exact" })
    .eq("creator_id", creatorId)
    .order("is_pinned", { ascending: false })
    .order("sort_order", { ascending: true })
    .range((page - 1) * limit, page * limit - 1)

  if (search) {
    query = query.or(
      `product.title.ilike.%${search}%,custom_title.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch items: ${error.message}`)
  }

  return { items: data || [], total: count || 0 }
}

export async function searchProducts(query: string, platform?: string) {
  const admin = createAdminClient()

  let dbQuery = admin
    .from("products")
    .select("*")
    .ilike("title", `%${query}%`)
    .limit(20)

  if (platform) {
    dbQuery = dbQuery.eq("platform", platform)
  }

  const { data, error } = await dbQuery

  if (error) {
    throw new Error(`Failed to search: ${error.message}`)
  }

  return data || []
}

export async function updateProductStatus(
  productId: string,
  isOos: boolean,
  price?: number
): Promise<void> {
  const admin = createAdminClient()

  const update: Record<string, any> = {
    is_oos: isOos,
    last_scraped_at: new Date().toISOString(),
  }
  if (price !== undefined) {
    update.agent_cached_price = price
  }

  const { error } = await admin
    .from("products")
    .update(update)
    .eq("id", productId)

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`)
  }

  revalidatePath("/")
}

export async function trackClickOut(
  productId: string,
  creatorId: string,
  agentId: string
): Promise<void> {
  const admin = createAdminClient()

  const { error } = await admin
    .from("click_events")
    .insert({
      product_id: productId,
      creator_id: creatorId,
      agent_id: agentId,
    })

  if (error) {
    console.error("Failed to track click event:", error.message)
  }
}
