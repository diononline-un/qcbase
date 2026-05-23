import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// POST /api/cron/oos-check
// Authorization: Bearer <CRON_SECRET>
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  // Get products that haven't been checked in the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: products, error } = await admin
    .from("products")
    .select("id, source_url")
    .or(`last_scraped_at.is.null,last_scraped_at.lt.${twentyFourHoursAgo}`)
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = []
  for (const product of products || []) {
    try {
      const { cnfansScraper } = await import("@/lib/scraping")
      const credentials = {
        username: process.env.SCRAPING_USERNAME || "qcbase_bot",
        password: process.env.SCRAPING_PASSWORD || "",
      }

      const result = await cnfansScraper.scrape(product.source_url, credentials)

      if (result.success) {
        await admin
          .from("products")
          .update({
            is_oos: result.isOos,
            agent_cached_price: result.price,
            last_scraped_at: new Date().toISOString(),
          })
          .eq("id", product.id)
      }

      results.push({ id: product.id, ...result })
    } catch (err) {
      results.push({
        id: product.id,
        success: false,
        error: err instanceof Error ? err.message : "Failed",
      })
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  })
}

// POST /api/cron/price-update
export async function PUT(request: Request) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return POST(request)
}
