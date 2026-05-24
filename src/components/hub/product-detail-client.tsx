"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import { buildAgentUrl } from "@/lib/agents"
import posthog from "posthog-js"
import { useCartStore } from "@/lib/stores/cart-store"

interface ProductDetailClientProps {
  images: { id: string; url: string; is_qc: boolean }[]
  product: { id: string; source_url: string; platform: string | null; title: string | null; agent_cached_price: number | null; is_oos: boolean }
  item: { id: string; custom_title: string | null; category: string | null }
  creatorId: string
  creatorSlug: string
  affiliateCodes: Record<string, string>
  theme: { primaryColor?: string }
  tier?: string
}

export function ProductDetailClient({ images, product, item, creatorId, creatorSlug, affiliateCodes, theme, tier }: ProductDetailClientProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const currentImage = images[imageIndex]?.url
  const accentColor = theme.primaryColor || "#6B7280"
  const addToCart = useCartStore((s) => s.addItem)

  const handleCheckout = (agentId: string) => {
    try { posthog.capture("click_out_to_agent", { product_id: product.id, agent_id: agentId, creator_id: creatorId }) } catch {}
    const url = buildAgentUrl(product.source_url, agentId, affiliateCodes[agentId])
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: item.custom_title || product.title || "Produkt",
      sourceUrl: product.source_url,
      price: product.agent_cached_price,
      platform: product.platform || "unknown",
      creatorSlug,
    })
  }

  const title = item.custom_title || product.title || "Produkt"

  return (
    <div className="space-y-4">
      {/* Image Display */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-black">
        {currentImage ? (
          <img src={currentImage} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-700">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* OOS Badge */}
        {product.is_oos && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-sm bg-rose-500/20 px-3 py-1.5 font-mono text-xs font-bold text-rose-400">
              [OOS]
            </span>
          </div>
        )}

        {/* Image Nav */}
        {images.length > 1 && (
          <>
            <button onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-sm bg-black/60 p-1.5 text-white hover:bg-black/80">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setImageIndex((i) => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm bg-black/60 p-1.5 text-white hover:bg-black/80">
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto">
          {images.map((img, i) => (
            <button key={img.id} onClick={() => setImageIndex(i)} className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm border-2 ${i === imageIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}>
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Add to Cart */}
      <Button
        className="h-12 w-full gap-2 font-semibold"
        style={{ backgroundColor: accentColor }}
        onClick={handleAddToCart}
      >
        <ShoppingCart className="h-4 w-4" />
        Add to Cart
      </Button>
    </div>
  )
}
