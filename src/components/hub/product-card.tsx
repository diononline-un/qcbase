import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AgentDropdown } from "./agent-dropdown"
import Image from "next/image"

interface ProductCardProps {
  item: {
    id: string
    category: string | null
    custom_title: string | null
    is_pinned: boolean
    product: {
      id: string
      source_url: string
      platform: string | null
      title: string | null
      agent_cached_price: number | null
      is_oos: boolean
    } | null
    images: {
      id: string
      url: string
      is_qc: boolean
    }[]
  }
  creatorId: string
  creatorSlug: string
  affiliateCodes: Record<string, string>
  theme: {
    primaryColor?: string
    backgroundColor?: string
  }
}

export function ProductCard({ item, creatorId, creatorSlug, affiliateCodes, theme }: ProductCardProps) {
  const product = item.product
  if (!product) return null

  const images = item.images || []
  const thumbnail = images.find((img) => !img.is_qc)?.url || images[0]?.url
  const qcImage = images.find((img) => img.is_qc)?.url
  const title = item.custom_title || product.title || "Produkt"
  const price = product.agent_cached_price

  return (
    <Card className="group overflow-hidden border-0 bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.is_oos && (
            <Badge variant="destructive" className="text-[10px] font-semibold">
              OOS
            </Badge>
          )}
          {item.is_pinned && (
            <Badge className="text-[10px] font-semibold" style={{ backgroundColor: theme.primaryColor }}>
              Top
            </Badge>
          )}
          {product.platform && (
            <Badge variant="secondary" className="text-[10px]">
              {product.platform}
            </Badge>
          )}
        </div>

        {/* QC Badge */}
        {qcImage && (
          <Badge variant="outline" className="absolute right-2 top-2 bg-background/80 text-[10px]">
            QC
          </Badge>
        )}
      </div>

      <CardContent className="p-3">
        <p className="line-clamp-2 text-sm font-medium leading-tight">{title}</p>
        {price !== null && (
          <p className="mt-1 text-sm font-semibold text-primary">
            ~{price.toFixed(2)} €
          </p>
        )}
      </CardContent>

      <CardFooter className="px-3 pb-3 pt-0">
        <AgentDropdown
          sourceUrl={product.source_url}
          productId={product.id}
          creatorId={creatorId}
          creatorSlug={creatorSlug}
          affiliateCodes={affiliateCodes}
          accentColor={theme.primaryColor}
        />
      </CardFooter>
    </Card>
  )
}
