import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getAgent } from "@/lib/agents"

// POST /api/scrape/product
// Body: { sourceUrl: string, agentId?: string }
export async function POST(request: Request) {
  try {
    const { sourceUrl, agentId = "cnfans" } = await request.json()

    if (!sourceUrl) {
      return NextResponse.json({ error: "sourceUrl is required" }, { status: 400 })
    }

    // Dynamic import to avoid bundling Playwright in edge
    const { cnfansScraper, mulebuyScraper } = await import("@/lib/scraping")

    const scraper = agentId === "mulebuy" ? mulebuyScraper : cnfansScraper

    const credentials = {
      username: process.env.SCRAPING_USERNAME || "qcbase_bot",
      password: process.env.SCRAPING_PASSWORD || "",
    }

    const result = await scraper.scrape(sourceUrl, credentials)

    if (result.success) {
      // Update product in DB
      const admin = createAdminClient()
      const { parseSourceUrl } = await import("@/lib/parser")
      const parsed = parseSourceUrl(sourceUrl)
      const normalizedUrl = parsed?.normalizedUrl || sourceUrl

      const { data: existing } = await admin
        .from("products")
        .select("id")
        .eq("normalized_url", normalizedUrl)
        .single()

      if (existing) {
        await admin
          .from("products")
          .update({
            agent_cached_price: result.price,
            is_oos: result.isOos,
            title: result.title,
            last_scraped_at: new Date().toISOString(),
          })
          .eq("id", existing.id)

        // Add images if found
        if (result.qcImages.length > 0) {
          for (let i = 0; i < result.qcImages.length; i++) {
            await admin.from("product_images").upsert(
              {
                product_id: existing.id,
                url: result.qcImages[i],
                is_qc: true,
                order: i,
              },
              { onConflict: "product_id,url" }
            )
          }
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Scraping failed" },
      { status: 500 }
    )
  }
}
