import type { Page } from "playwright"

export interface ScrapeResult {
  success: boolean
  price: number | null
  isOos: boolean
  qcImages: string[]
  title: string | null
  error?: string
}

export interface AgentCredentials {
  username: string
  password: string
}

export interface AgentScraperConfig {
  agentId: string
  loginUrl: string
  searchUrl: string
  login: (page: Page, credentials: AgentCredentials) => Promise<boolean>
  searchByUrl: (page: Page, sourceUrl: string) => Promise<boolean>
  extractProductData: (page: Page) => Promise<ScrapeResult>
}

export abstract class BaseAgentScraper implements AgentScraperConfig {
  abstract agentId: string
  abstract loginUrl: string
  abstract searchUrl: string

  abstract login(page: Page, credentials: AgentCredentials): Promise<boolean>
  abstract searchByUrl(page: Page, sourceUrl: string): Promise<boolean>
  abstract extractProductData(page: Page): Promise<ScrapeResult>

  async scrape(sourceUrl: string, credentials: AgentCredentials): Promise<ScrapeResult> {
    const { chromium } = await import("playwright")
    const browser = await chromium.launch({ headless: true })

    try {
      const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      })
      const page = await context.newPage()

      // Rate limiting
      await page.waitForTimeout(1000)

      // Login
      const loggedIn = await this.login(page, credentials)
      if (!loggedIn) {
        return { success: false, price: null, isOos: false, qcImages: [], title: null, error: "Login failed" }
      }

      // Search for product
      const found = await this.searchByUrl(page, sourceUrl)
      if (!found) {
        return { success: false, price: null, isOos: false, qcImages: [], title: null, error: "Product not found" }
      }

      // Extract data
      const result = await this.extractProductData(page)

      await context.close()
      return result
    } catch (error) {
      return {
        success: false,
        price: null,
        isOos: false,
        qcImages: [],
        title: null,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    } finally {
      await browser.close()
    }
  }
}

// Factory for loading scrapers lazily
let scraperInstance: BaseAgentScraper | null = null

export function setAgentProvider(scraper: BaseAgentScraper) {
  scraperInstance = scraper
}

export function getAgentProvider(): BaseAgentScraper | null {
  return scraperInstance
}
