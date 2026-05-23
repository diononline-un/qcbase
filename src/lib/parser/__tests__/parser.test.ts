import { describe, it, expect } from "vitest"
import { parseSourceUrl } from "../parser"

describe("parseSourceUrl", () => {
  describe("Weidian", () => {
    it("parses standard weidian URL", () => {
      const result = parseSourceUrl("https://weidian.com/item.html?itemID=123456789")
      expect(result?.platform).toBe("weidian")
      expect(result?.itemId).toBe("123456789")
      expect(result?.normalizedUrl).toBe("weidian:123456789")
    })

    it("parses weidian URL with extra params", () => {
      const result = parseSourceUrl("https://weidian.com/item.html?itemID=987654321&spider_token=xxxx")
      expect(result?.platform).toBe("weidian")
      expect(result?.itemId).toBe("987654321")
    })

    it("parses weidian /item/ path", () => {
      const result = parseSourceUrl("https://weidian.com/item/123456789.html")
      expect(result?.platform).toBe("weidian")
      expect(result?.itemId).toBe("123456789")
    })
  })

  describe("Taobao", () => {
    it("parses standard taobao URL", () => {
      const result = parseSourceUrl("https://item.taobao.com/item.htm?id=123456789")
      expect(result?.platform).toBe("taobao")
      expect(result?.itemId).toBe("123456789")
    })
  })

  describe("1688", () => {
    it("parses standard 1688 URL", () => {
      const result = parseSourceUrl("https://detail.1688.com/offer/123456789.html")
      expect(result?.platform).toBe("1688")
      expect(result?.itemId).toBe("123456789")
    })
  })

  describe("Pandabuy encoded", () => {
    it("recursively parses pandabuy encoded weidian URL", () => {
      const encoded = encodeURIComponent("https://weidian.com/item.html?itemID=123456789")
      const result = parseSourceUrl(`https://pandabuy.com/product?url=${encoded}`)
      expect(result?.platform).toBe("weidian")
      expect(result?.itemId).toBe("123456789")
    })
  })

  describe("Unknown", () => {
    it("returns unknown for unrecognized URLs", () => {
      const result = parseSourceUrl("https://example.com/product/123")
      expect(result?.platform).toBe("unknown")
      expect(result?.itemId).toBeNull()
    })
  })
})
