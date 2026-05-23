export interface ParsedLink {
  platform: "weidian" | "taobao" | "1688" | "dhgate" | "unknown"
  itemId: string | null
  normalizedUrl: string
  originalUrl: string
}

export const PATTERNS = {
  weidian: {
    itemId: [
      /weidian\.com\/item\.html\?itemID=(\d+)/i,
      /weidian\.com\/item\.html\?.*?itemID=(\d+)/i,
      /weidian\.com\/item\/(\d+)/i,
    ],
    domain: /weidian\.com/i,
  },
  taobao: {
    itemId: [
      /item\.taobao\.com\/item\.htm\?.*?\bid=(\d+)/i,
      /item\.taobao\.com\/item\.htm\?id=(\d+)/i,
      /taobao\.com\/item\/(\d+)/i,
      /m\.tb\.cn\/h\.(\w+)/i,
    ],
    domain: /(taobao\.com|tb\.cn)/i,
  },
  tmall: {
    itemId: [
      /detail\.tmall\.com\/item\.htm\?.*?\bid=(\d+)/i,
      /detail\.tmall\.com\/item\.htm\?id=(\d+)/i,
    ],
    domain: /tmall\.com/i,
  },
  "1688": {
    itemId: [
      /detail\.1688\.com\/offer\/(\d+)\.html/i,
      /m\.1688\.com\/offer\/(\d+)\.html/i,
      /1688\.com\/offer\/(\d+)\.html/i,
    ],
    domain: /1688\.com/i,
  },
  dhgate: {
    itemId: [
      /sale\.dhgate\.com\/([A-Za-z0-9]+)/i,
      /dhgate\.com\/product\/([^/]+)/i,
      /m\.dhgate\.com\/product\/([^/]+)/i,
    ],
    domain: /dhgate\.com/i,
  },
  pandabuy: {
    encodedUrl: [
      /pandabuy\.com\/product\?url=([^&]+)/i,
      /pandabuy\.com\/product\?.*?url=([^&]+)/i,
    ],
    domain: /pandabuy\.com/i,
  },
}

function tryPatterns(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

export function parseSourceUrl(url: string): ParsedLink | null {
  try {
    const decoded = decodeURIComponent(url.trim())
    const result: ParsedLink = {
      platform: "unknown",
      itemId: null,
      normalizedUrl: decoded,
      originalUrl: url,
    }

    // Handle Pandabuy encoded URLs (recursive)
    if (PATTERNS.pandabuy.domain.test(decoded)) {
      const encoded = tryPatterns(decoded, PATTERNS.pandabuy.encodedUrl)
      if (encoded) {
        const inner = decodeURIComponent(encoded)
        return parseSourceUrl(inner)
      }
    }

    // Weidian
    if (PATTERNS.weidian.domain.test(decoded)) {
      const itemId = tryPatterns(decoded, PATTERNS.weidian.itemId)
      result.platform = "weidian"
      if (itemId) {
        result.itemId = itemId
        result.normalizedUrl = `weidian:${itemId}`
      }
      return result
    }

    // Taobao (also handles tmall)
    if (PATTERNS.taobao.domain.test(decoded) || PATTERNS.tmall.domain.test(decoded)) {
      const itemId =
        tryPatterns(decoded, PATTERNS.taobao.itemId) ||
        tryPatterns(decoded, PATTERNS.tmall.itemId)
      result.platform = "taobao"
      if (itemId && /^\d+$/.test(itemId)) {
        result.itemId = itemId
        result.normalizedUrl = `taobao:${itemId}`
      }
      return result
    }

    // 1688
    if (PATTERNS["1688"].domain.test(decoded)) {
      const itemId = tryPatterns(decoded, PATTERNS["1688"].itemId)
      result.platform = "1688"
      if (itemId) {
        result.itemId = itemId
        result.normalizedUrl = `1688:${itemId}`
      }
      return result
    }

    // DHGate
    if (PATTERNS.dhgate.domain.test(decoded)) {
      const itemId = tryPatterns(decoded, PATTERNS.dhgate.itemId)
      result.platform = "dhgate"
      if (itemId) {
        result.itemId = itemId
        result.normalizedUrl = `dhgate:${itemId}`
      }
      return result
    }

    return result
  } catch {
    return {
      platform: "unknown",
      itemId: null,
      normalizedUrl: url,
      originalUrl: url,
    }
  }
}
