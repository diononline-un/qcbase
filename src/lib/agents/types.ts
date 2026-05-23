export interface AgentConfig {
  id: string
  name: string
  logoUrl: string
  baseUrl: string
  supportedPlatforms: string[]
  buildUrl: (params: {
    sourceUrl: string
    itemId: string
    platform: string
    affiliateCode?: string
  }) => string
}

export interface ParsedLink {
  platform: "weidian" | "taobao" | "1688" | "dhgate" | "unknown"
  itemId: string | null
  normalizedUrl: string
  originalUrl: string
}
