"use client"

import { useState } from "react"
import { GalleryModal } from "@/components/hub/gallery-modal"

interface ProductGalleryProps {
  images: { id: string; url: string; is_qc: boolean; order: number }[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.order - b.order)
  const [activeIndex, setActiveIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted">
        <svg className="h-16 w-16 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  const activeImage = sorted[activeIndex]

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-[16/9] w-full cursor-pointer overflow-hidden bg-muted"
        onClick={() => sorted.length > 0 && setModalOpen(true)}
      >
        <img
          src={activeImage.url}
          alt=""
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        {activeImage.is_qc && (
          <span className="absolute left-2 top-2 bg-background/80 px-2 py-0.5 font-mono text-[10px]">QC</span>
        )}
        {sorted.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setActiveIndex((p) => (p === 0 ? sorted.length - 1 : p - 1)) }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground/70 backdrop-blur opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Previous image"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActiveIndex((p) => (p === sorted.length - 1 ? 0 : p + 1)) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground/70 backdrop-blur opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Next image"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        {sorted.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(i) }}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? "w-4 bg-foreground" : "w-1.5 bg-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className={`shrink-0 overflow-hidden bg-muted border-2 transition-colors ${
                idx === activeIndex
                  ? "border-foreground"
                  : "border-transparent hover:border-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              <img
                src={img.url}
                alt=""
                className="h-20 w-16 object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <GalleryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        images={sorted}
      />
    </div>
  )
}
