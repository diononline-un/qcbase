import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { scrapeProductImages } from "@/lib/scraping/image-scraper"
import { parseSourceUrl } from "@/lib/parser"

// POST /api/scrape/images
// Body: { sourceUrl: string }
export async function POST(request: Request) {
  try {
    const { sourceUrl } = await request.json()

    if (!sourceUrl) {
      return NextResponse.json({ error: "sourceUrl is required" }, { status: 400 })
    }

    const admin = createAdminClient()

    // Find or create product
    const parsed = parseSourceUrl(sourceUrl)
    const normalizedUrl = parsed?.normalizedUrl || sourceUrl

    let productId: string
    const { data: existing } = await admin
      .from("products")
      .select("id")
      .eq("normalized_url", normalizedUrl)
      .single()

    if (existing) {
      productId = existing.id
    } else {
      const { data: product } = await admin
        .from("products")
        .insert({
          source_url: sourceUrl,
          normalized_url: normalizedUrl,
          platform: parsed?.platform || null,
          item_id: parsed?.itemId || null,
        })
        .select("id")
        .single()
      productId = product.id
    }

    // Scrape images from source page
    const result = await scrapeProductImages(sourceUrl)

    if (result.success) {
      // Update title if found
      if (result.title) {
        await admin
          .from("products")
          .update({ title: result.title })
          .eq("id", productId)
      }

      // Store images
      const stored: string[] = []
      for (let i = 0; i < result.images.length; i++) {
        try {
          await admin.from("product_images").upsert(
            {
              product_id: productId,
              url: result.images[i],
              is_qc: false,
              order: i,
            },
            { onConflict: "product_id,url" }
          )
          stored.push(result.images[i])
        } catch {
          // Duplicate URL OK
        }
      }

      return NextResponse.json({
        success: true,
        productId,
        images: stored,
        title: result.title,
      })
    }

    return NextResponse.json({
      success: false,
      error: result.error,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Scraping failed" },
      { status: 500 }
    )
  }
}
