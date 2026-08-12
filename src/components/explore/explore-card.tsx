"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { GalleryModal } from "@/components/hub/gallery-modal"

interface ExploreCardProps {
  item: {
    id: string
    category: string | null
    creator_id?: string
    creatorName?: string
    product: {
      id: string
      source_url: string
      platform: string | null
      title: string | null
      agent_cached_price: number | null
      is_oos: boolean
    } | null
    images: {
      id: string
      url: string
      is_qc: boolean
    }[]
    clickCount: number
  }
}

export function ExploreCard({ item }: ExploreCardProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const product = item.product
  if (!product) return null

  const images = item.images || []
  const thumbnail = images.find((img) => !img.is_qc)?.url || images[0]?.url
  const qcImage = images.find((img) => img.is_qc)?.url
  const title = product.title || "Produkt"
  const price = product.agent_cached_price
  const creatorSlug = item.creatorName || "explore"

  return (
    <div className="group">
      <div
        className={`relative aspect-square cursor-pointer overflow-hidden bg-muted ${product.is_oos ? "opacity-40" : ""}`}
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
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {product.is_oos && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-muted-foreground bg-background/80 px-2 py-1 rounded">
              STATUS: OUT_OF_STOCK
            </span>
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <Badge variant="secondary" className="text-[10px] font-mono">
            {product.platform}
          </Badge>
          {item.clickCount > 0 && (
            <Badge variant="outline" className="text-[10px]">
              {item.clickCount} clicks
            </Badge>
          )}
        </div>
      </div>

      <Link href={`/${creatorSlug}/product/${product.id}`} className="block px-0.5 py-2">
        <p className="line-clamp-2 text-sm font-medium leading-tight hover:underline">{title}</p>
        {price !== null && (
          <p className="mt-0.5 font-mono text-sm text-muted-foreground">
            ~{Number(price).toFixed(2).replace(".", ",")} €
          </p>
        )}
        {item.creatorName && (
          <span className="mt-0.5 inline-block font-mono text-[10px] text-muted-foreground">
            by @{item.creatorName}
          </span>
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
