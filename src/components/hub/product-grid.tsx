import { ProductCard } from "./product-card"

interface ProductGridProps {
  items: any[]
  creatorId: string
  creatorSlug: string
  affiliateCodes: Record<string, string>
  theme: {
    primaryColor?: string
    backgroundColor?: string
  }
}

export function ProductGrid({ items, creatorId, creatorSlug, affiliateCodes, theme }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          creatorId={creatorId}
          creatorSlug={creatorSlug}
          affiliateCodes={affiliateCodes}
          theme={theme}
        />
      ))}
    </div>
  )
}
