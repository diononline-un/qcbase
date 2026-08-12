"use client"

import { useState } from "react"
import Link from "next/link"
import { useCartStore } from "@/lib/stores/cart-store"
import { ALL_AGENTS, buildAgentUrl } from "@/lib/agents"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, X, ChevronLeft, ChevronRight, Play, Trash2, ExternalLink } from "lucide-react"

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const launchAgent = useCartStore((s) => s.launchAgent)
  const nextProduct = useCartStore((s) => s.nextProduct)
  const prevProduct = useCartStore((s) => s.prevProduct)
  const currentIndex = useCartStore((s) => s.currentIndex)
  const setCurrentIndex = useCartStore((s) => s.setCurrentIndex)
  const [selectedAgents, setSelectedAgents] = useState<Record<string, string>>({})

  const getAgent = (itemId: string) => selectedAgents[itemId] || "gtbuy"

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <ShoppingCart className="h-12 w-12 text-zinc-600" />
        <p className="mt-4 font-mono text-sm text-zinc-400">CART IS EMPTY</p>
        <Link href="/explore" className="mt-4 font-mono text-xs text-zinc-500 hover:text-zinc-300">
          &larr; EXPLORE PRODUCTS
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-bold tracking-tight text-white">
              QCBase
            </Link>
            <span className="font-mono text-[10px] tracking-wider text-zinc-500">CART</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-zinc-400">{items.length} ITEMS</span>
            <button onClick={clearCart} className="inline-flex items-center gap-1 font-mono text-[10px] text-rose-400 hover:text-rose-300">
              <Trash2 className="h-3 w-3" />
              CLEAR ALL
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`rounded-md border p-4 transition-colors ${
                currentIndex === idx
                  ? "border-zinc-600 bg-zinc-800/50"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono py-0 h-4 border-zinc-700 text-zinc-400"
                    >
                      {item.platform}
                    </Badge>
                    <span className={`font-mono text-[10px] ${
                      item.status === "opened" ? "text-emerald-400" :
                      item.status === "done" ? "text-zinc-600" :
                      item.status === "oos" ? "text-rose-400" : "text-zinc-500"
                    }`}>
                      {item.status === "pending" ? "PENDING" :
                       item.status === "opened" ? "OPENED" :
                       item.status === "done" ? "DONE" : "OOS"}
                    </span>
                    {item.price && (
                      <span className="font-mono text-[10px] text-zinc-500">
                        €{Number(item.price).toFixed(2).replace(".", ",")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white leading-tight">{item.title}</p>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 font-mono text-[10px] text-zinc-600 hover:text-zinc-400"
                  >
                    <ExternalLink className="h-3 w-3" />
                    W2C
                  </a>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="flex-shrink-0 text-zinc-600 hover:text-rose-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <select
                  value={getAgent(item.id)}
                  onChange={(e) =>
                    setSelectedAgents((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                  className="h-8 rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
                >
                  {ALL_AGENTS.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>

                <Button
                  size="sm"
                  className="h-8 gap-1.5 font-mono text-xs"
                  onClick={() => {
                    setCurrentIndex(idx)
                    launchAgent(getAgent(item.id))
                  }}
                >
                  <Play className="h-3 w-3" />
                  OPEN IN AGENT
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-6 bg-zinc-800" />

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex === 0}
            onClick={prevProduct}
            className="gap-1 border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            PREV
          </Button>

          <span className="font-mono text-sm text-zinc-400">
            {currentIndex + 1} / {items.length}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex >= items.length - 1}
            onClick={nextProduct}
            className="gap-1 border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30"
          >
            NEXT
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  )
}
