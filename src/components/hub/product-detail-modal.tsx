"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, ExternalLink, ThumbsUp, ThumbsDown, ShoppingCart } from "lucide-react"
import { useState } from "react"
import { buildAgentUrl } from "@/lib/agents"
import { useCartStore } from "@/lib/stores/cart-store"
import posthog from "posthog-js"

interface ProductDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any
  creatorId: string
  creatorSlug: string
  affiliateCodes: Record<string, string>
  theme: { primaryColor?: string }
  tier?: string
}

const AGENTS = ["litbuy","oopbuy","hipobuy","acbuy","gtbuy","usfans","kakobuy","cssbuy","cnfans","superbuy","lovegobuy"]

export function ProductDetailModal({ open, onOpenChange, item, creatorId, creatorSlug, affiliateCodes, theme, tier }: ProductDetailModalProps) {
  const product = item.product
  if (!product) return null

  const images = item.images || []
  const qcImages = images.filter((i: any) => i.is_qc)
  const allImages = [...images.filter((i: any) => !i.is_qc), ...qcImages]
  const [imageIndex, setImageIndex] = useState(0)
  const title = item.custom_title || product.title || "Produkt"
  const accentColor = theme.primaryColor || "#6B7280"
  const addToCart = useCartStore((s) => s.addItem)
  const [glCount, setGlCount] = useState(0)
  const [rlCount, setRlCount] = useState(0)
  const [voted, setVoted] = useState<"gl" | "rl" | null>(null)
  const availableAgents = tier === "free" ? AGENTS.slice(0, 1) : AGENTS

  const handleCheckout = (agentId: string) => {
    try { posthog.capture("click_out_to_agent", { product_id: product.id, agent_id: agentId, creator_id: creatorId }) } catch {}
    const url = buildAgentUrl(product.source_url, agentId, affiliateCodes[agentId])
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title,
      sourceUrl: product.source_url,
      price: product.agent_cached_price,
      platform: product.platform || "unknown",
      creatorSlug,
    })
  }

  const handleVote = (type: "gl" | "rl") => {
    if (voted === type) return
    if (type === "gl") { setGlCount(c => c + 1); if (voted === "rl") setRlCount(c => c - 1) }
    else { setRlCount(c => c + 1); if (voted === "gl") setGlCount(c => c - 1) }
    setVoted(type)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden border-zinc-800 bg-zinc-950 p-0 backdrop-blur-sm sm:rounded-md">
        <div className="grid max-h-[85vh] overflow-auto md:grid-cols-2">
          {/* Left: Images */}
          <div className="relative flex flex-col bg-black">
            <div className="relative flex-1">
              {allImages[imageIndex] ? (
                <img src={allImages[imageIndex].url} alt={title} className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-700">
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              {product.is_oos && (
                <div className="absolute inset-x-0 top-4 mx-auto w-fit rounded bg-rose-900/90 px-4 py-2 font-mono text-xs font-bold text-rose-200">[OOS]</div>
              )}
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setImageIndex(i => (i - 1 + allImages.length) % allImages.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-sm bg-black/60 p-1.5 text-white"><ChevronLeft className="h-4 w-4" /></button>
                  <button onClick={() => setImageIndex(i => (i + 1) % allImages.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm bg-black/60 p-1.5 text-white"><ChevronRight className="h-4 w-4" /></button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-1 overflow-x-auto border-t border-zinc-800 p-2">
                {allImages.map((img: any, i: number) => (
                  <button key={i} onClick={() => setImageIndex(i)} className={`h-12 w-12 flex-shrink-0 overflow-hidden rounded-sm border-2 ${i === imageIndex ? "border-white" : "border-transparent opacity-60"}`}>
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col overflow-auto border-l border-zinc-800 bg-zinc-950">
            <div className="flex-1 p-6">
              <h2 className="text-lg font-semibold leading-tight text-white">{title}</h2>
              {product.agent_cached_price !== null && (
                <p className="mt-1 font-mono text-xl font-bold text-white">€{Number(product.agent_cached_price).toFixed(2).replace(".", ",")}</p>
              )}

              {/* Sizes */}
              {product.sizes && (
                <div className="mt-4">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Sizes</p>
                  <p className="mt-1 font-mono text-sm text-zinc-300">{product.sizes}</p>
                </div>
              )}

              {/* Tech Specs */}
              <div className="mt-4 space-y-2 font-mono text-xs text-zinc-400">
                <div className="flex justify-between"><span className="text-zinc-600">SOURCE</span><span className="uppercase text-zinc-300">{product.platform || "UNKNOWN"}</span></div>
                {product.item_id && <div className="flex justify-between"><span className="text-zinc-600">ID</span><span className="text-zinc-300">{product.item_id}</span></div>}
                <div className="flex justify-between"><span className="text-zinc-600">STATUS</span><span className={product.is_oos ? "text-rose-400" : "text-emerald-400"}>{product.is_oos ? "OOS" : "AVAILABLE"}</span></div>
                {item.category && <div className="flex justify-between"><span className="text-zinc-600">CATEGORY</span><span className="text-zinc-300">{item.category}</span></div>}
              </div>

              <Separator className="my-4 bg-zinc-800" />

              {/* W2C */}
              <a href={product.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 hover:text-zinc-300">
                <ExternalLink className="h-3 w-3" />W2C: {(product.source_url || "").slice(0, 50)}...
              </a>

              {/* GL/RL Voting */}
              <div className="mt-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-zinc-600 mr-1">RATE QUALITY:</span>
                <Button variant="outline" size="sm" onClick={() => handleVote("gl")} className={`h-7 gap-1 text-xs ${voted === "gl" ? "border-emerald-500 bg-emerald-900/30 text-emerald-300" : "border-emerald-900 text-emerald-400 hover:bg-emerald-900/20"}`}><ThumbsUp className="h-3 w-3" />GL{glCount>0 && ` (${glCount})`}</Button>
                <Button variant="outline" size="sm" onClick={() => handleVote("rl")} className={`h-7 gap-1 text-xs ${voted === "rl" ? "border-rose-500 bg-rose-900/30 text-rose-300" : "border-rose-900 text-rose-400 hover:bg-rose-900/20"}`}><ThumbsDown className="h-3 w-3" />RL{rlCount>0 && ` (${rlCount})`}</Button>
              </div>
            </div>

            {/* Cart + Checkout */}
            <div className="border-t border-zinc-800 bg-zinc-900 p-4">
              <Button className="h-12 w-full gap-2 font-semibold mb-3" style={{ backgroundColor: accentColor }} onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4" />Add to Cart
              </Button>

              <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Checkout via Agent</p>
              <div className="grid grid-cols-2 gap-2">
                {availableAgents.map((agentId) => (
                  <Button key={agentId} variant="outline" size="sm" onClick={() => handleCheckout(agentId)} className="justify-start gap-2 border-zinc-700 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white">
                    <ExternalLink className="h-3 w-3" />{agentId.charAt(0).toUpperCase() + agentId.slice(1)}
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
