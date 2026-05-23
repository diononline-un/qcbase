import type { Page } from "playwright"
import { BaseAgentScraper, type AgentCredentials, type ScrapeResult } from "../base"

export class MulebuyScraper extends BaseAgentScraper {
  agentId = "mulebuy"
  loginUrl = "https://mulebuy.com/login"
  searchUrl = "https://mulebuy.com/search"

  async login(page: Page, credentials: AgentCredentials): Promise<boolean> {
    try {
      await page.goto(this.loginUrl, { waitUntil: "networkidle" })
      await page.waitForTimeout(2000)

      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first()
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first()

      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        await emailInput.fill(credentials.username)
        await passwordInput.fill(credentials.password)
        await submitButton.click()
        await page.waitForTimeout(3000)
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
      await page.goto(`https://mulebuy.com/item?url=${encoded}`, { waitUntil: "networkidle" })
      await page.waitForTimeout(2000)
      return true
    } catch {
      return false
    }
  }

  async extractProductData(page: Page): Promise<ScrapeResult> {
    try {
      // Price
      const priceEl = page.locator('.product-price, .price, [class*="price"]').first()
      let price: number | null = null
      if (await priceEl.count() > 0) {
        const text = await priceEl.textContent()
        const match = text?.match(/[\d.,]+/)
        if (match) price = parseFloat(match[0].replace(",", "."))
      }

      // OOS
      const isOos = await page.locator(
        '.out-of-stock, .sold-out, text=Out of Stock, text=Sold Out'
      ).first().count() > 0

      // QC Images
      const qcImages: string[] = []
      const imgs = page.locator('.product-image img, .product-gallery img, .swiper-slide img')
      const count = await imgs.count()
      for (let i = 0; i < Math.min(count, 10); i++) {
        const src = await imgs.nth(i).getAttribute("src")
        if (src) qcImages.push(src)
      }

      // Title
      const title = await page.locator('h1, .product-name, .product-title').first().textContent().catch(() => null)

      return {
        success: true,
        price,
        isOos,
        qcImages: [...new Set(qcImages)].slice(0, 5),
        title: title?.trim() || null,
      }
    } catch (error) {
      return { success: false, price: null, isOos: false, qcImages: [], title: null, error: "Extraction failed" }
    }
  }
}

export const mulebuyScraper = new MulebuyScraper()
