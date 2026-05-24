import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ExternalLink, ThumbsUp, ThumbsDown } from "lucide-react"
import { ProductDetailClient } from "@/components/hub/product-detail-client"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ creator: string; productId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { creator } = await params
  return { title: `Product – ${creator} – QCBase` }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { creator: creatorSlug, productId } = await params
  const admin = createAdminClient()

  const { data: settings } = await admin
    .from("creator_settings")
    .select("creator_id, theme")
    .eq("subdomain", creatorSlug)
    .single()

  if (!settings) notFound()

  const { data: profile } = await admin
    .from("profiles")
    .select("id, username, tier")
    .eq("id", settings.creator_id)
    .single()

  if (!profile) notFound()

  const { data: item } = await admin
    .from("creator_items")
    .select("id, category, custom_title, is_pinned, creator_id, product_id")
    .eq("product_id", productId)
    .eq("creator_id", settings.creator_id)
    .single()

  if (!item) notFound()

  const { data: product } = await admin
    .from("products")
    .select("id, source_url, normalized_url, platform, item_id, title, agent_cached_price, is_oos")
    .eq("id", productId)
    .single()

  if (!product) notFound()

  const { data: images } = await admin
    .from("product_images")
    .select("id, url, is_qc")
    .eq("product_id", productId)
    .order("order", { ascending: true })

  const theme = (settings.theme as any) || {}
  const title = item.custom_title || product.title || "Produkt"

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href={`/${creatorSlug}`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
            Back to {creatorSlug}
          </Link>
          <span className="font-mono text-xs text-zinc-600">{product.platform?.toUpperCase()}</span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left: Image Carousel */}
          <div className="space-y-4">
            <ProductDetailClient
              images={images || []}
              product={product}
              item={item}
              creatorId={profile.id}
              creatorSlug={creatorSlug}
              affiliateCodes={{}}
              theme={theme}
              tier={profile.tier}
            />
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {product.agent_cached_price && (
                <p className="mt-2 font-mono text-2xl font-bold">
                  €{Number(product.agent_cached_price).toFixed(2).replace(".", ",")}
                </p>
              )}
            </div>

            {/* Tech Specs */}
            <div className="space-y-2 rounded-md border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-zinc-600">SOURCE</span>
                <span className="uppercase text-zinc-300">{product.platform || "UNKNOWN"}</span>
              </div>
              {product.item_id && (
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-zinc-600">ID</span>
                  <span className="text-zinc-300">{product.item_id}</span>
                </div>
              )}
              <div className="flex justify-between font-mono text-xs">
                <span className="text-zinc-600">STATUS</span>
                <span className={product.is_oos ? "text-rose-400" : "text-emerald-400"}>
                  {product.is_oos ? "OOS" : "AVAILABLE"}
                </span>
              </div>
              {item.category && (
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-zinc-600">CATEGORY</span>
                  <span className="text-zinc-300">{item.category}</span>
                </div>
              )}
            </div>

            {/* W2C Link */}
            <a
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 hover:text-zinc-300"
            >
              <ExternalLink className="h-3 w-3" />
              W2C: {product.source_url.slice(0, 60)}...
            </a>

            <Separator className="bg-zinc-800" />

            {/* Checkout Buttons */}
            <div className="space-y-2">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Checkout via Agent
              </p>
              <div className="grid grid-cols-2 gap-2">
                {["litbuy","oopbuy","hipobuy","acbuy","gtbuy","usfans","kakobuy","cssbuy","cnfans","superbuy","lovegobuy"].map((agentId) => (
                  <Button
                    key={agentId}
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 border-zinc-700 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white"
                    onClick={() => {
                      // handled by client component
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                    {agentId.charAt(0).toUpperCase() + agentId.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* GL/RL Voting */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-zinc-600">RATE QUALITY:</span>
              <Button variant="outline" size="sm" className="h-7 gap-1 border-emerald-900 text-xs text-emerald-400 hover:bg-emerald-900/20">
                <ThumbsUp className="h-3 w-3" /> GL
              </Button>
              <Button variant="outline" size="sm" className="h-7 gap-1 border-rose-900 text-xs text-rose-400 hover:bg-rose-900/20">
                <ThumbsDown className="h-3 w-3" /> RL
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
