import type { AgentConfig, ParsedLink } from "./types"

const encodedUrl = (sourceUrl: string) => encodeURIComponent(sourceUrl)

export const litbuy: AgentConfig = {
  id: "litbuy",
  name: "LitBuy",
  logoUrl: "/agents/litbuy.png",
  baseUrl: "https://litbuy.com",
  supportedPlatforms: ["weidian", "taobao", "1688", "dhgate"],
  buildUrl: ({ sourceUrl, affiliateCode }) =>
    `https://litbuy.com/item?url=${encodedUrl(sourceUrl)}${affiliateCode ? `&aff=${affiliateCode}` : ""}`,
}

export const oopbuy: AgentConfig = {
  id: "oopbuy",
  name: "OopBuy",
  logoUrl: "/agents/oopbuy.png",
  baseUrl: "https://oopbuy.com",
  supportedPlatforms: ["weidian", "taobao", "1688", "dhgate"],
  buildUrl: ({ sourceUrl, affiliateCode }) =>
    `https://oopbuy.com/item?url=${encodedUrl(sourceUrl)}${affiliateCode ? `&aff=${affiliateCode}` : ""}`,
}

export const hipobuy: AgentConfig = {
  id: "hipobuy",
  name: "HipoBuy",
  logoUrl: "/agents/hipobuy.png",
  baseUrl: "https://hipobuy.com",
  supportedPlatforms: ["weidian", "taobao", "1688", "dhgate"],
  buildUrl: ({ sourceUrl, affiliateCode }) =>
    `https://hipobuy.com/item?url=${encodedUrl(sourceUrl)}${affiliateCode ? `&aff=${affiliateCode}` : ""}`,
}

export const acbuy: AgentConfig = {
  id: "acbuy",
  name: "ACBuy",
  logoUrl: "/agents/acbuy.png",
  baseUrl: "https://acbuy.com",
  supportedPlatforms: ["weidian", "taobao", "1688", "dhgate"],
  buildUrl: ({ sourceUrl, affiliateCode }) =>
    `https://acbuy.com/item?url=${encodedUrl(sourceUrl)}${affiliateCode ? `&aff=${affiliateCode}` : ""}`,
}

export const gtbuy: AgentConfig = {
  id: "gtbuy",
  name: "GTBuy",
  logoUrl: "/agents/gtbuy.png",
  baseUrl: "https://gtbuy.com",
  supportedPlatforms: ["weidian", "taobao", "1688", "dhgate"],
  buildUrl: ({ sourceUrl, affiliateCode }) =>
    `https://gtbuy.com/item?url=${encodedUrl(sourceUrl)}${affiliateCode ? `&aff=${affiliateCode}` : ""}`,
}

export const usfans: AgentConfig = {
  id: "usfans",
  name: "USFans",
  logoUrl: "/agents/usfans.png",
  baseUrl: "https://usfans.com",
  supportedPlatforms: ["weidian", "taobao", "1688", "dhgate"],
  buildUrl: ({ sourceUrl, affiliateCode }) =>
    `https://usfans.com/item?url=${encodedUrl(sourceUrl)}${affiliateCode ? `&aff=${affiliateCode}` : ""}`,
}

export const kakobuy: AgentConfig = {
  id: "kakobuy",
  name: "KakoBuy",
  logoUrl: "/agents/kakobuy.png",
  baseUrl: "https://kakobuy.com",
  supportedPlatforms: ["weidian", "taobao", "1688", "dhgate"],
  buildUrl: ({ sourceUrl, affiliateCode }) =>
    `https://kakobuy.com/item?url=${encodedUrl(sourceUrl)}${affiliateCode ? `&aff=${affiliateCode}` : ""}`,
}

export const cssbuy: AgentConfig = {
  id: "cssbuy",
  name: "CSSBuy",
  logoUrl: "/agents/cssbuy.png",
  baseUrl: "https://cssbuy.com",
  supportedPlatforms: ["weidian", "taobao", "1688", "dhgate"],
  buildUrl: ({ sourceUrl, affiliateCode }) =>
    `https://cssbuy.com/item?url=${encodedUrl(sourceUrl)}${affiliateCode ? `&aff=${affiliateCode}` : ""}`,
}

export const cnfans: AgentConfig = {
  id: "cnfans",
  name: "CNFans",
  logoUrl: "/agents/cnfans.png",
  baseUrl: "https://cnfans.com",
  supportedPlatforms: ["weidian", "taobao", "1688", "dhgate"],
  buildUrl: ({ sourceUrl, affiliateCode }) =>
    `https://cnfans.com/search/all?keyword=${encodedUrl(sourceUrl)}${affiliateCode ? `&aff=${affiliateCode}` : ""}`,
}

export const superbuy: AgentConfig = {
  id: "superbuy",
  name: "Superbuy",
  logoUrl: "/agents/superbuy.png",
  baseUrl: "https://superbuy.com",
  supportedPlatforms: ["weidian", "taobao", "1688", "dhgate"],
  buildUrl: ({ sourceUrl, affiliateCode }) =>
    `https://superbuy.com/en/page/buy?url=${encodedUrl(sourceUrl)}${affiliateCode ? `&tag=${affiliateCode}` : ""}`,
}

export const lovegobuy: AgentConfig = {
  id: "lovegobuy",
  name: "LoveGoBuy",
  logoUrl: "/agents/lovegobuy.png",
  baseUrl: "https://lovegobuy.com",
  supportedPlatforms: ["weidian", "taobao", "1688", "dhgate"],
  buildUrl: ({ sourceUrl, affiliateCode }) =>
    `https://lovegobuy.com/item?url=${encodedUrl(sourceUrl)}${affiliateCode ? `&aff=${affiliateCode}` : ""}`,
}
