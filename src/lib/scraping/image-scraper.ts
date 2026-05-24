import { chromium } from "playwright"

export interface ImageScrapeResult {
  success: boolean
  images: string[]
  title: string | null
  error?: string
}

export async function scrapeProductImages(sourceUrl: string): Promise<ImageScrapeResult> {
  let browser = null
  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 720 },
    })
    const page = await context.newPage()

    await page.goto(sourceUrl, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    }).catch(() => {
      // Page might block, continue anyway
    })

    await page.waitForTimeout(2000)

    // Scroll to trigger lazy images
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0
        const distance = 300
        const timer = setInterval(() => {
          window.scrollBy(0, distance)
          totalHeight += distance
          if (totalHeight >= document.body.scrollHeight || totalHeight > 3000) {
            clearInterval(timer)
            resolve()
          }
        }, 200)
      })
    }).catch(() => {})

    await page.waitForTimeout(1000)

    // Extract images
    const images = await page.evaluate(() => {
      const urls = new Set<string>()
      const imgs = document.querySelectorAll("img")
      imgs.forEach((img) => {
        // Try different image sources
        const src = img.src || img.getAttribute("data-src") || img.getAttribute("data-original") || ""
        if (src && src.startsWith("http") && !src.includes("data:image")) {
          // Filter out tiny icons, logos, etc.
          const w = img.naturalWidth || img.width || 0
          const h = img.naturalHeight || img.height || 0
          if ((w > 100 || h > 100) || (w === 0 && h === 0)) {
            urls.add(src)
          }
        }
      })

      // Also check background images
      const allElements = document.querySelectorAll("*")
      allElements.forEach((el) => {
        const bg = (el as HTMLElement).style?.backgroundImage
        if (bg && bg.includes("url(")) {
          const match = bg.match(/url\(["']?([^"')]+)["']?\)/)
          if (match && match[1].startsWith("http")) {
            urls.add(match[1])
          }
        }
      })

      return Array.from(urls).slice(0, 20)
    })

    // Extract title
    const title = await page.title().catch(() => null)

    await context.close()

    return {
      success: true,
      images: images.filter((url) =>
        // Filter noise: skip tracking pixels, favicons, etc.
        !url.includes("favicon") &&
        !url.includes("logo") &&
        !url.includes("icon") &&
        !url.match(/\.svg(\?|$)/) &&
        url.length > 10
      ),
      title: title?.slice(0, 200) || null,
    }
  } catch (error) {
    return {
      success: false,
      images: [],
      title: null,
      error: error instanceof Error ? error.message : "Scrape failed",
    }
  } finally {
    if (browser) {
      await browser.close().catch(() => {})
    }
  }
}
