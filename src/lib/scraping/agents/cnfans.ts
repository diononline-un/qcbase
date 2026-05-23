import type { Page } from "playwright"
import { BaseAgentScraper, type AgentCredentials, type ScrapeResult } from "../base"

export class CNFansScraper extends BaseAgentScraper {
  agentId = "cnfans"
  loginUrl = "https://cnfans.com/login"
  searchUrl = "https://cnfans.com/search/all"

  async login(page: Page, credentials: AgentCredentials): Promise<boolean> {
    try {
      await page.goto(this.loginUrl, { waitUntil: "networkidle" })
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 }).catch(() => null)
      const emailInput = page.locator('input[type="email"], input[name="email"]').first()
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
      const submitButton = page.locator('button[type="submit"]').first()

      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        await emailInput.fill(credentials.username)
        await passwordInput.fill(credentials.password)
        await submitButton.click()
        await page.waitForNavigation({ waitUntil: "networkidle" }).catch(() => page.waitForTimeout(3000))
        return true
      }

      return false
    } catch {
      return false
    }
  }

  async searchByUrl(page: Page, sourceUrl: string): Promise<boolean> {
    try {
      const encoded = encodeURIComponent(sourceUrl)
      await page.goto(`${this.searchUrl}?keyword=${encoded}`, { waitUntil: "networkidle" })
      await page.waitForTimeout(2000)

      // Check if product listing appears
      const productLink = page.locator('.product-item a, .goods-item a, [class*="product"] a').first()
      if (await productLink.count() > 0) {
        await productLink.click()
        await page.waitForNavigation({ waitUntil: "networkidle" }).catch(() => page.waitForTimeout(2000))
        return true
      }

      return false
    } catch {
      return false
    }
  }

  async extractProductData(page: Page): Promise<ScrapeResult> {
    try {
      // Price extraction
      const priceSelectors = [
        '.price, .product-price, [class*="price"] span',
        '.current-price, .sale-price',
      ]
      let price: number | null = null
      for (const selector of priceSelectors) {
        const el = page.locator(selector).first()
        if (await el.count() > 0) {
          const text = await el.textContent()
          const match = text?.match(/[\d.,]+/)
          if (match) {
            price = parseFloat(match[0].replace(",", "."))
            break
          }
        }
      }

      // OOS detection
      const isOos = await page.locator(
        'text=out of stock, text=sold out, text=ausverkauft, text=nicht verfügbar, .oos, .sold-out, .out-of-stock'
      ).first().count() > 0

      // QC Images
      const qcImages: string[] = []
      const imgSelectors = [
        '.product-images img, .goods-images img, [class*="gallery"] img',
        '.swiper-slide img, .carousel img',
      ]
      for (const selector of imgSelectors) {
        const imgs = page.locator(selector)
        const count = await imgs.count()
        for (let i = 0; i < Math.min(count, 10); i++) {
          const src = await imgs.nth(i).getAttribute("src")
          if (src && (src.includes("qc") || src.includes("quality") || src.startsWith("http"))) {
            qcImages.push(src)
          }
        }
        if (qcImages.length > 0) break
      }

      // Title
      const title = await page.locator(
        'h1, .product-title, .goods-title, [class*="title"]'
      ).first().textContent().catch(() => null)

      return {
        success: true,
        price,
        isOos,
        qcImages: [...new Set(qcImages)].slice(0, 5),
        title: title?.trim() || null,
      }
    } catch (error) {
      return {
        success: false,
        price: null,
        isOos: false,
        qcImages: [],
        title: null,
        error: error instanceof Error ? error.message : "Extraction failed",
      }
    }
  }
}

export const cnfansScraper = new CNFansScraper()
