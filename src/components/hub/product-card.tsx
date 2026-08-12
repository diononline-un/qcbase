"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { GalleryModal } from "./gallery-modal"

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
    rating: { avg: number; count: number } | null
  }
  creatorId: string
  creatorSlug: string
  affiliateCodes: Record<string, string>
  theme: { primaryColor?: string; backgroundColor?: string }
  tier?: string
}

export function ProductCard({ item, creatorSlug, theme }: ProductCardProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const product = item.product
  if (!product) return null

  const images = item.images || []
  const thumbnail = images.find((img) => !img.is_qc)?.url || images[0]?.url
  const qcImage = images.find((img) => img.is_qc)?.url
  const title = item.custom_title || product.title || "Produkt"
  const price = product.agent_cached_price
  const rating = item.rating

  return (
    <div className={`group ${product.is_oos ? "opacity-50" : ""}`}>
      <div
        className="relative aspect-[4/5] cursor-pointer overflow-hidden bg-muted"
        onClick={() => images.length > 0 && setGalleryOpen(true)}
      >
        {thumbnail ? (
          <>
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-0"
              loading="lazy"
            />
            {qcImage && (
              <img
                src={qcImage}
                alt={`${title} QC`}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                loading="lazy"
              />
            )}
          </>
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

        {qcImage && (
          <Badge variant="outline" className="absolute right-2 top-2 bg-background/80 font-mono text-[10px]">QC</Badge>
        )}
      </div>

      <Link href={`/${creatorSlug}/product/${product.id}`} className="block px-0.5 py-2">
        <p className="line-clamp-2 text-sm font-medium leading-tight hover:underline">{title}</p>
        {rating && rating.count > 0 && (
          <Stars avg={rating.avg} count={rating.count} />
        )}
        {price !== null && (
          <p className="font-mono text-sm text-muted-foreground">~{Number(price).toFixed(2).replace(".", ",")} €</p>
        )}
      </Link>

      <GalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={images}
      />
    </div>
  )
}

function Stars({ avg, count }: { avg: number; count: number }) {
  const rounded = Math.round(avg * 2) / 2
  return (
    <div className="mt-0.5 flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rounded >= star
        const half = rounded === star - 0.5
        return (
          <svg
            key={star}
            className={`h-3 w-3 ${filled ? "text-amber-400" : half ? "text-amber-400/60" : "text-zinc-300 dark:text-zinc-600"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )
      })}
      <span className="font-mono text-[10px] text-muted-foreground">({count})</span>
    </div>
  )
}
