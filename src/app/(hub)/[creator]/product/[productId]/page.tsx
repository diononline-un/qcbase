import { createAdminClient } from "@/lib/supabase/admin"
import { ALL_AGENTS, buildAgentUrl } from "@/lib/agents"
import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteNav } from "@/components/ui/site-nav"
import { ProductGallery } from "./product-gallery"
import { RatingSection } from "./rating-section"
import { CommentSection } from "./comment-section"
import { RecommendedSection } from "./recommended-section"
import { addToCollection } from "./actions"
import { Button } from "@/components/ui/button"
import { BookmarkPlus } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ creator: string; productId: string }>
}) {
  const { creator: creatorSlug, productId } = await params
  const admin = createAdminClient()

  const { data: settings } = await admin
    .from("creator_settings")
    .select("id, creator_id, subdomain, affiliate_codes, preferred_agent, disable_platform_refs, recommendation_weights, theme")
    .eq("subdomain", creatorSlug)
    .single()

  if (!settings) notFound()

  const { data: creatorAccount } = await admin
    .from("user_accounts")
    .select("id, username, tier")
    .eq("id", settings.creator_id)
    .single()

  const { data: product } = await admin
    .from("products")
    .select("id, source_url, platform, item_id, title, description, sizes, agent_cached_price, is_oos")
    .eq("id", productId)
    .single()

  if (!product) notFound()

  const { data: images } = await admin
    .from("product_images")
    .select("id, url, is_qc, order, dominant_color")
    .eq("product_id", productId)
    .order("order", { ascending: true })

  const { data: creatorItem } = await admin
    .from("creator_items")
    .select("id, category")
    .eq("creator_id", settings.creator_id)
    .eq("product_id", productId)
    .single()

  const threadId = creatorItem?.id

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value
  let currentUserId: string | null = null

  if (sessionToken) {
    const { data: sessionUser } = await admin
      .from("user_sessions")
      .select("user_id")
      .eq("token", sessionToken)
      .single()
    if (sessionUser) currentUserId = sessionUser.user_id
  }

  let userRating: number | null = null
  if (currentUserId) {
    const { data: rating } = await admin
      .from("product_ratings")
      .select("rating")
      .eq("user_id", currentUserId)
      .eq("product_id", productId)
      .single()
    userRating = rating?.rating || null
  }

  let userCollections: any[] = []
  if (currentUserId) {
    const { data: collections } = await admin
      .from("user_collections")
      .select("id, name")
      .eq("user_id", currentUserId)
      .limit(20)
    userCollections = collections || []
  }

  const ratingRows = (await admin
    .from("product_ratings")
    .select("rating")
    .eq("product_id", productId)).data as { rating: number }[] || []

  const avgRating = ratingRows.length > 0
    ? ratingRows.reduce((sum: number, r: any) => sum + r.rating, 0) / ratingRows.length
    : 0
  const ratingCount = ratingRows.length

  const affiliateCodes: Record<string, string> =
    (settings.affiliate_codes as Record<string, string>) || {}
  const preferredAgent = settings.preferred_agent as string | null
  const disableRefs = settings.disable_platform_refs as boolean
  const tier = (creatorAccount?.tier as string) || "free"
  const recommendationWeights =
    (settings.recommendation_weights as Record<string, number> | null) || {
      price_bias: 0.3, brand_bias: 0.2, category_bias: 0.3, ctr_bias: 0.2,
    }

  const sizes = product.sizes
    ? product.sizes.split(",").map((s: string) => s.trim()).filter(Boolean)
    : []

  const imageList = (images || []) as { id: string; url: string; is_qc: boolean; order: number }[]

  const price = product.agent_cached_price !== null
    ? Number(product.agent_cached_price)
    : null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/${creatorSlug}`} className="font-mono text-xs text-muted-foreground hover:text-foreground">
              &larr; {creatorAccount?.username || creatorSlug}
            </Link>
          </div>
          <Link href="/" className="text-xl font-bold tracking-tight">QCBase</Link>
          <SiteNav />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <ProductGallery images={imageList} />

        <div className="mt-8 space-y-6">
          <div>
            {product.platform && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {product.platform}
              </span>
            )}
            <h1 className="mt-1 text-2xl font-bold leading-tight">
              {product.title || "Untitled Product"}
            </h1>
            {price !== null && (
              <p className="mt-2 font-mono text-3xl tracking-tight">
                &euro;{Number(price).toFixed(2).replace(".", ",")}
              </p>
            )}
          </div>

          {sizes.length > 0 && (
            <div>
              <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size: string) => (
                  <span
                    key={size}
                    className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1.5 font-mono text-xs dark:border-zinc-700"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.description && (
            <div>
              <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          <RatingSection
            productId={product.id}
            currentRating={userRating}
            avgRating={avgRating}
            ratingCount={ratingCount}
            isLoggedIn={!!currentUserId}
          />

          {currentUserId && userCollections.length > 0 && (
            <AddToCollectionSection
              productId={product.id}
              collections={userCollections}
              action={addToCollection}
            />
          )}
        </div>

        <div className="mt-12 space-y-6">
          <AgentCheckout
            product={product}
            preferredAgent={preferredAgent}
            affiliateCodes={affiliateCodes}
            disableRefs={!!(tier === "creator_plus" && disableRefs)}
            creatorSlug={creatorSlug}
            tier={tier}
          />
        </div>

        <CommentSection
          productId={product.id}
          currentUserId={currentUserId}
          threadId={threadId || ""}
        />

        <RecommendedSection
          productId={product.id}
          creatorId={settings.creator_id}
          platform={product.platform}
          category={creatorItem?.category || null}
          weights={recommendationWeights}
          creatorSlug={creatorSlug}
          tier={tier}
          affiliateCodes={affiliateCodes}
        />
      </main>
    </div>
  )
}

function AgentCheckout({
  product,
  preferredAgent,
  affiliateCodes,
  disableRefs,
  creatorSlug,
  tier,
}: {
  product: { id: string; source_url: string; platform: string | null; item_id: string | null }
  preferredAgent: string | null
  affiliateCodes: Record<string, string>
  disableRefs: boolean
  creatorSlug: string
  tier: string
}) {
  "use client"

  const QC_REF_CODES: Record<string, string> = {
    litbuy: "QCBASE",
    oopbuy: "QCBASE",
    hipobuy: "QCBASE",
    acbuy: "42ME6V",
    gtbuy: "PSKAK696A",
    usfans: "QCBASE",
    kakobuy: "QCBASE",
    cssbuy: "QCBASE",
    cnfans: "QCBASE",
    superbuy: "QCBASE",
    lovegobuy: "QCBASE",
  }

  const visibleAgents = tier === "free"
    ? ALL_AGENTS.slice(0, 1)
    : ALL_AGENTS

  const preferred = preferredAgent && visibleAgents.find((a) => a.id === preferredAgent)
  const others = preferred
    ? visibleAgents.filter((a) => a.id !== preferredAgent)
    : visibleAgents

  return (
    <div>
      <h2 className="mb-4 font-mono text-sm uppercase tracking-wider">Checkout via Agent</h2>

      {preferred && (
        <div className="mb-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-emerald-500">Creator&apos;s Pick</p>
          <a
            href={buildAgentUrl(product.source_url, preferred.id, affiliateCodes[preferred.id])}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            {preferred.name}
          </a>
        </div>
      )}

      {others.length > 0 && !(preferred && disableRefs) && (
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {preferred ? "Other Agents" : "Available Agents"}
          </p>
          <div className="flex flex-wrap gap-2">
            {others.map((agent) => {
              const codeKey = disableRefs ? undefined : (affiliateCodes[agent.id] || QC_REF_CODES[agent.id])
              const href = buildAgentUrl(
                product.source_url,
                agent.id,
                disableRefs ? undefined : codeKey,
              )
              return (
                <a
                  key={agent.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-2 text-xs transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                >
                  {agent.name}
                  {!disableRefs && (
                    <span className="font-mono text-[10px] text-muted-foreground">/ref</span>
                  )}
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function AddToCollectionSection({
  productId,
  collections,
  action,
}: {
  productId: string
  collections: { id: string; name: string }[]
  action: (collectionId: string, productId: string) => Promise<{ success?: boolean; error?: string }>
}) {
  "use client"

  return (
    <div className="mt-6">
      <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Add to Collection
      </h3>
      <form
        action={async (formData: FormData) => {
          const collectionId = formData.get("collectionId") as string
          if (!collectionId) return
          await action(collectionId, productId)
        }}
        className="flex items-center gap-2"
      >
        <select
          name="collectionId"
          className="h-8 rounded-md border border-zinc-200 bg-background px-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">Select collection...</option>
          {collections.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-1.5 font-mono text-xs transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
        >
          <BookmarkPlus className="h-3 w-3" />
          ADD
        </button>
      </form>
    </div>
  )
}
