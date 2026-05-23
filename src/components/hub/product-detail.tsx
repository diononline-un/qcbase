"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, ThumbsUp, ThumbsDown, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface ProductDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: {
    id: string
    category: string | null
    custom_title: string | null
    is_pinned: boolean
    product: {
      id: string
      source_url: string
      platform: string | null
      title: string | null
      agent_cached_price: number | null
      is_oos: boolean
      item_id?: string | null
      normalized_url?: string
    } | null
    images: {
      id: string
      url: string
      is_qc: boolean
    }[]
  }
  creatorId: string
  creatorSlug: string
  affiliateCodes: Record<string, string>
  theme: {
    primaryColor?: string
    backgroundColor?: string
  }
}

const AGENT_LIST = [
  { id: "litbuy", name: "LitBuy" },
  { id: "oopbuy", name: "OopBuy" },
  { id: "hipobuy", name: "HipoBuy" },
  { id: "acbuy", name: "ACBuy" },
  { id: "gtbuy", name: "GTBuy" },
  { id: "usfans", name: "USFans" },
  { id: "kakobuy", name: "KakoBuy" },
  { id: "cssbuy", name: "CSSBuy" },
  { id: "cnfans", name: "CNFans" },
  { id: "superbuy", name: "Superbuy" },
  { id: "lovegobuy", name: "LoveGoBuy" },
]

export function ProductDetailDialog({
  open, onOpenChange, item, creatorId, creatorSlug, affiliateCodes, theme,
}: ProductDetailProps) {
  const product = item.product
  if (!product) return null

  const images = item.images || []
  const qcImages = images.filter((img) => img.is_qc)
  const regularImages = images.filter((img) => !img.is_qc)
  const allImages = [...regularImages, ...qcImages]
  const [imageIndex, setImageIndex] = useState(0)
  const currentImage = allImages[imageIndex]?.url

  const title = item.custom_title || product.title || "Produkt"
  const accentColor = theme.primaryColor || "#6B7280"
  const supabase = createClient()

  const handleCheckout = (agentId: string) => {
    try {
      supabase.from("click_events").insert({
        product_id: product.id,
        creator_id: creatorId,
        agent_id: agentId,
      })
    } catch {}

    const affiliateCode = affiliateCodes[agentId] || ""
    const encoded = encodeURIComponent(product.source_url)
    let url = ""
    switch (agentId) {
      case "cnfans":
        url = `https://cnfans.com/search/all?keyword=${encoded}${affiliateCode ? `&aff=${affiliateCode}` : ""}`
        break
      case "superbuy":
        url = `https://superbuy.com/en/page/buy?url=${encoded}${affiliateCode ? `&tag=${affiliateCode}` : ""}`
        break
      default:
        url = `https://${agentId}.com/item?url=${encoded}${affiliateCode ? `&aff=${affiliateCode}` : ""}`
    }
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl gap-0 overflow-hidden border-zinc-800 bg-zinc-950 p-0 backdrop-blur-sm sm:rounded-md">
        <div className="grid h-full max-h-[85vh] overflow-auto md:grid-cols-2">
          {/* Left: Image Carousel */}
          <div className="relative flex flex-col bg-black">
            <div className="relative flex-1">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-600">
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* OOS Warning */}
              {product.is_oos && (
                <div className="absolute inset-x-0 top-4 mx-auto w-fit rounded bg-red-900/90 px-4 py-2 font-mono text-xs font-bold text-red-200">
                  STATUS: OUT_OF_STOCK
                </div>
              )}

              {/* Image Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImageIndex((i) => (i - 1 + allImages.length) % allImages.length) }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImageIndex((i) => (i + 1) % allImages.length) }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex gap-1 overflow-x-auto border-t border-zinc-800 p-2">
                {allImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={(e) => { e.stopPropagation(); setImageIndex(i) }}
                    className={`h-12 w-12 flex-shrink-0 overflow-hidden rounded border-2 ${i === imageIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Tech Specs + Checkout */}
          <div className="flex flex-col overflow-auto border-l border-zinc-800 bg-zinc-950">
            <div className="flex-1 p-6">
              <h2 className="text-lg font-semibold leading-tight text-white">{title}</h2>

              {/* Price */}
              {product.agent_cached_price !== null && (
                <p className="mt-1 font-mono text-xl font-bold text-white">
                  €{product.agent_cached_price.toFixed(2).replace(".", ",")}
                </p>
              )}

              {/* Tech Specs Block */}
              <div className="mt-6 space-y-2 font-mono text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span className="text-zinc-600">SOURCE</span>
                  <span className="text-zinc-300 uppercase">{product.platform || "UNKNOWN"}</span>
                </div>
                {product.item_id && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600">ID</span>
                    <span className="text-zinc-300">{product.item_id}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-600">STATUS</span>
                  <span className={product.is_oos ? "text-red-400" : "text-green-400"}>
                    {product.is_oos ? "OOS" : "AVAILABLE"}
                  </span>
                </div>
                {item.category && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600">CATEGORY</span>
                    <span className="text-zinc-300">{item.category}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4 bg-zinc-800" />

              {/* W2C Link */}
              <a
                href={product.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 hover:text-zinc-300"
              >
                <ExternalLink className="h-3 w-3" />
                W2C: {product.source_url.length > 50 ? product.source_url.slice(0, 50) + "..." : product.source_url}
              </a>

              {/* GL/RL Voting */}
              <div className="mt-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-zinc-600 mr-1">RATE QUALITY:</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 border-green-900 text-xs text-green-400 hover:bg-green-900/20 hover:text-green-300"
                >
                  <ThumbsUp className="h-3 w-3" />
                  GL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 border-red-900 text-xs text-red-400 hover:bg-red-900/20 hover:text-red-300"
                >
                  <ThumbsDown className="h-3 w-3" />
                  RL
                </Button>
              </div>
            </div>

            {/* Checkout Block */}
            <div className="border-t border-zinc-800 bg-zinc-900 p-4">
              <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Checkout via Agent
              </p>
              <div className="grid grid-cols-2 gap-2">
                {AGENT_LIST.map((agent) => (
                  <Button
                    key={agent.id}
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 border-zinc-700 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white"
                    style={{
                      borderColor: "var(--creator-accent, #52525B)",
                      backgroundColor: "transparent",
                    }}
                    onClick={() => handleCheckout(agent.id)}
                  >
                    <ExternalLink className="h-3 w-3" />
                    {agent.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
