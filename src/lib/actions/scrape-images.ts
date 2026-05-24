"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { parseSourceUrl } from "@/lib/parser"
import { revalidatePath } from "next/cache"

export async function scrapeImagesAction(sourceUrl: string) {
  if (!sourceUrl) return

  const admin = createAdminClient()
  const parsed = parseSourceUrl(sourceUrl)
  const normalizedUrl = parsed?.normalizedUrl || sourceUrl

  const { data: product } = await admin
    .from("products")
    .select("id")
    .eq("normalized_url", normalizedUrl)
    .single()

  if (!product) return

  const { scrapeProductImages } = await import("@/lib/scraping/image-scraper")
  const result = await scrapeProductImages(sourceUrl)

  if (result.success) {
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

  revalidatePath("/links")
}
