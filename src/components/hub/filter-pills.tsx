"use client"

import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface FilterPillsProps {
  categories: string[]
  selectedCategory?: string
  accentColor?: string
}

export function FilterPills({ categories, selectedCategory, accentColor }: FilterPillsProps) {
  const router = useRouter()

  const selectCategory = (cat: string | null) => {
    const params = new URLSearchParams(window.location.search)
    if (cat) params.set("category", cat)
    else params.delete("category")
    router.push(`?${params.toString()}`)
  }

  if (categories.length === 0) return null

  return (
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
  )
}
