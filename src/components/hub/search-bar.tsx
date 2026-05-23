"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  defaultValue?: string
  categories: string[]
  selectedCategory?: string
}

export function SearchBar({ defaultValue = "", categories, selectedCategory }: SearchBarProps) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      const params = new URLSearchParams(window.location.search)
      if (term) {
        params.set("q", term)
      } else {
        params.delete("q")
      }
      if (selectedCategory) {
        params.set("category", selectedCategory)
      }
      router.push(`?${params.toString()}`)
    }, 300),
    [selectedCategory, router]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    debouncedSearch(e.target.value)
  }

  const handleClear = () => {
    setValue("")
    debouncedSearch("")
  }

  const selectCategory = (cat: string | null) => {
    const params = new URLSearchParams(window.location.search)
    if (cat) {
      params.set("category", cat)
    } else {
      params.delete("category")
    }
    if (value) params.set("q", value)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Produkte suchen..."
          value={value}
          onChange={handleChange}
          className="pl-10 pr-10"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => selectCategory(null)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Alle
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function debounce<F extends (...args: any[]) => any>(fn: F, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<F>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
