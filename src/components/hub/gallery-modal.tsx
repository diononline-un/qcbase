"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface GalleryModalProps {
  open: boolean
  onClose: () => void
  images: { url: string; is_qc: boolean }[]
}

export function GalleryModal({ open, onClose, images }: GalleryModalProps) {
  const [index, setIndex] = useState(0)

  if (!open) return null

  const goNext = () => setIndex((p) => (p + 1) % images.length)
  const goPrev = () => setIndex((p) => (p - 1 + images.length) % images.length)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); goPrev() }}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); goNext() }}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <img
        src={images[index]?.url}
        alt=""
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIndex(i) }}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {images[index]?.is_qc && (
        <span className="absolute left-4 top-4 bg-white/10 px-2 py-0.5 font-mono text-xs text-white/80">QC</span>
      )}
    </div>
  )
}
