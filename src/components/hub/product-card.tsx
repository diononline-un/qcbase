"use client"

import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ProductDetailModal } from "./product-detail-modal"

interface ProductCardProps {
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
      sizes: string | null
      agent_cached_price: number | null
      is_oos: boolean
    } | null
    images: { id: string; url: string; is_qc: boolean }[]
  }
  creatorId: string
  creatorSlug: string
  affiliateCodes: Record<string, string>
  theme: { primaryColor?: string; backgroundColor?: string }
  tier?: string
}

export function ProductCard({ item, creatorId, creatorSlug, affiliateCodes, theme, tier }: ProductCardProps) {
  const [open, setOpen] = useState(false)
  const product = item.product
  if (!product) return null

  const images = item.images || []
  const thumbnail = images.find((img) => !img.is_qc)?.url || images[0]?.url
  const qcImage = images.find((img) => img.is_qc)?.url
  const title = item.custom_title || product.title || "Produkt"
  const price = product.agent_cached_price

  return (
    <>
      <div
        className={`group cursor-pointer ${product.is_oos ? "opacity-50" : ""}`}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {thumbnail ? (
            <div className="relative h-full w-full">
              <img src={thumbnail} alt={title} className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-0" loading="lazy" />
              {qcImage && (
                <img src={qcImage} alt={`${title} QC`} className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100" loading="lazy" />
              )}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}

          {product.is_oos && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-foreground/90 px-2 py-1 font-mono text-[10px] font-semibold text-background">[OOS]</span>
            </div>
          )}

          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {item.is_pinned && (
              <Badge className="text-[10px] font-semibold text-white" style={{ backgroundColor: theme.primaryColor }}>Top</Badge>
            )}
          </div>

          {qcImage && <Badge variant="outline" className="absolute right-2 top-2 bg-background/80 font-mono text-[10px]">QC</Badge>}
        </div>

        <div className="px-0.5 py-2">
          <p className="line-clamp-2 text-sm font-medium leading-tight">{title}</p>
          <div className="mt-1 flex items-center gap-2">
            {price !== null && (
              <span className="font-mono text-sm text-muted-foreground">~{Number(price).toFixed(2).replace(".", ",")} €</span>
            )}
            {product.sizes && (
              <Badge variant="secondary" className="font-mono text-[10px]">{product.sizes}</Badge>
            )}
          </div>
        </div>
      </div>

      <ProductDetailModal
        open={open}
        onOpenChange={setOpen}
        item={item}
        creatorId={creatorId}
        creatorSlug={creatorSlug}
        affiliateCodes={affiliateCodes}
        theme={theme}
        tier={tier}
      />
    </>
  )
}
