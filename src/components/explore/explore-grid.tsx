import { ExploreCard } from "./explore-card"

interface ExploreGridProps {
  items: any[]
}

export function ExploreGrid({ items }: ExploreGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <ExploreCard key={item.id} item={item} />
      ))}
    </div>
  )
}
