"use client"

import Link from "next/link"
import { useCartStore } from "@/lib/stores/cart-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, X, ExternalLink, ChevronLeft, ChevronRight, Play } from "lucide-react"
import { useState } from "react"
import { buildAgentUrl } from "@/lib/agents"

export function CartButton() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const launchAgent = useCartStore((s) => s.launchAgent)
  const nextProduct = useCartStore((s) => s.nextProduct)
  const prevProduct = useCartStore((s) => s.prevProduct)
  const currentIndex = useCartStore((s) => s.currentIndex)
  const [open, setOpen] = useState(false)

  if (items.length === 0) {
    return (
      <Link href="/cart" className="text-zinc-400 hover:text-white">
        <ShoppingCart className="h-5 w-5" />
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center gap-1.5 text-zinc-400 hover:text-white"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="font-mono text-xs">{items.length}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border border-zinc-800 bg-zinc-900 shadow-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-mono text-xs text-zinc-400">
              CART ({items.length})
            </span>
            <button onClick={clearCart} className="font-mono text-[10px] text-rose-400 hover:text-rose-300">
              CLEAR
            </button>
          </div>

          <Separator className="bg-zinc-800" />

          <div className="max-h-64 overflow-y-auto">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-4 py-2.5 ${currentIndex === idx ? "bg-zinc-800" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs text-white">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px] font-mono py-0 h-4">
                      {item.platform}
                    </Badge>
                    {item.price && (
                      <span className="font-mono text-[10px] text-zinc-500">
                        €{Number(item.price).toFixed(2).replace(".", ",")}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`font-mono text-[10px] ${
                  item.status === "opened" ? "text-emerald-400" :
                  item.status === "done" ? "text-zinc-600" :
                  item.status === "oos" ? "text-rose-400" : "text-zinc-500"
                }`}>
                  {item.status === "pending" ? "○" : item.status === "opened" ? "●" : item.status === "done" ? "✓" : "⚠"}
                </span>
                <button onClick={() => removeItem(item.id)} className="text-zinc-600 hover:text-rose-400">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <Separator className="bg-zinc-800" />

          {/* Navigation */}
          <div className="flex items-center justify-between px-4 py-2">
            <button onClick={prevProduct} disabled={currentIndex === 0} className="text-zinc-500 hover:text-white disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-xs text-zinc-400">{currentIndex + 1}/{items.length}</span>
            <button onClick={nextProduct} disabled={currentIndex >= items.length - 1} className="text-zinc-500 hover:text-white disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3">
            <Button className="h-10 w-full gap-2 font-semibold text-xs" onClick={launchAgent}>
              <Play className="h-3 w-3" />
              Open in Agent
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
