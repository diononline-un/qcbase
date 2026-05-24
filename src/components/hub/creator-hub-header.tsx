"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { CartButton } from "@/components/cart/cart-button"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreatorHubHeaderProps {
  creator: { username: string | null; avatar_url: string | null }
  categories: string[]
  selectedCategory?: string
  defaultValue?: string
  accentColor?: string
}

export function CreatorHubHeader({ creator, categories, selectedCategory, defaultValue = "", accentColor }: CreatorHubHeaderProps) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(defaultValue)

  const initials = creator.username?.slice(0, 2).toUpperCase() || "??"

  const applySearch = (value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value) params.set("q", value)
    else params.delete("q")
    router.push(`?${params.toString()}`)
  }

  const selectCategory = (cat: string | null) => {
    const params = new URLSearchParams(window.location.search)
    if (cat) params.set("category", cat)
    else params.delete("category")
    if (searchValue) params.set("q", searchValue)
    router.push(`?${params.toString()}`)
  }

  return (
    <>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-background/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={creator.avatar_url || undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold tracking-tight">
              {creator.username || "Creator"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </button>
            <CartButton />
          </div>
        </div>

        {/* Search Overlay */}
        {searchOpen && (
          <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div className="relative mx-auto max-w-7xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  applySearch(e.target.value)
                }}
                className="border-zinc-200 pl-10 pr-10 dark:border-zinc-800"
              />
              <button onClick={() => { setSearchOpen(false); setSearchValue(""); applySearch("") }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Filter Pills */}
      {categories.length > 0 && (
        <div className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2.5">
            <button
              onClick={() => selectCategory(null)}
              className={cn(
                "flex-shrink-0 rounded-full border px-3 py-1 font-mono text-xs transition-colors",
                !selectedCategory
                  ? "border-foreground bg-foreground text-background"
                  : "border-zinc-200 text-muted-foreground hover:border-zinc-400 dark:border-zinc-800"
              )}
              style={!selectedCategory && accentColor ? { backgroundColor: accentColor, borderColor: accentColor } : undefined}
            >
              ALL
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                className={cn(
                  "flex-shrink-0 rounded-full border px-3 py-1 font-mono text-xs transition-colors",
                  selectedCategory === cat
                    ? "border-foreground bg-foreground text-background"
                    : "border-zinc-200 text-muted-foreground hover:border-zinc-400 dark:border-zinc-800"
                )}
                style={selectedCategory === cat && accentColor ? { backgroundColor: accentColor, borderColor: accentColor } : undefined}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
