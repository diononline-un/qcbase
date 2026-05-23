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
  tier?: string
}

export function ProductGrid({ items, creatorId, creatorSlug, affiliateCodes, theme, tier }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-5">
      {items.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          creatorId={creatorId}
          creatorSlug={creatorSlug}
          affiliateCodes={affiliateCodes}
          theme={theme}
          tier={tier}
        />
      ))}
    </div>
  )
}
