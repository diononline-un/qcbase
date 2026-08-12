"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { parseSourceUrl } from "@/lib/parser"
import { revalidatePath } from "next/cache"

interface ImportRow {
  title?: string
  source_url?: string
  price?: string
  sizes?: string
  category?: string
  platform?: string
}

export async function batchImportProducts(
  creatorId: string,
  rows: ImportRow[]
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const admin = createAdminClient()
  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (const row of rows) {
    if (!row.source_url) {
      skipped++
      continue
    }

    try {
      const parsed = parseSourceUrl(row.source_url.trim())
      const normalizedUrl = parsed?.normalizedUrl || row.source_url.trim()

      // Check if product exists
      const { data: existing } = await admin
        .from("products")
        .select("id")
        .eq("normalized_url", normalizedUrl)
        .single()

      let productId: string

      if (existing) {
        productId = existing.id
        skipped++
      } else {
        const priceNum = row.price ? parseFloat(row.price.replace(/[^0-9.,]/g, "").replace(",", ".")) || null : null

        const { data: product } = await admin
          .from("products")
          .insert({
            source_url: row.source_url.trim(),
            normalized_url: normalizedUrl,
            platform: row.platform || parsed?.platform || null,
            item_id: parsed?.itemId || null,
            title: row.title || null,
            sizes: row.sizes || null,
            agent_cached_price: priceNum,
          })
          .select("id")
          .single()

        productId = product.id
        imported++
      }

      // Link to creator
      try {
        await admin.from("creator_items").upsert(
          {
            creator_id: creatorId,
            product_id: productId,
            category: row.category || null,
            custom_title: row.title || null,
          },
          { onConflict: "creator_id,product_id" }
        )
      } catch (e) { console.error("Failed to upsert creator item", e) }

    } catch (e: any) {
      errors.push(`${row.title || row.source_url}: ${e.message}`)
    }
  }

  revalidatePath("/links")
  return { imported, skipped, errors }
}
