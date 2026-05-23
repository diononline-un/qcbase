import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowRight, TrendingUp } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  let trending: any[] = []
  let profiles: any[] = []
  const productMap = new Map<string, any>()
  const creatorMap = new Map<string, any>()

  try {
    const admin = createAdminClient()

    const { data: trendingItems } = await admin
      .from("creator_items")
      .select("id, category, custom_title, product_id, creator_id")
      .limit(8)

    if ((trendingItems || []).length > 0) {
      const productIds = [...new Set(trendingItems!.map((i: any) => i.product_id))]
      const creatorIds = [...new Set(trendingItems!.map((i: any) => i.creator_id))]

      const { data: products } = await admin
        .from("products")
        .select("id, title, platform, agent_cached_price, source_url, normalized_url")
        .limit(100)
      products?.forEach((p: any) => productMap.set(p.id, p))

      const { data: creatorProfiles } = await admin
        .from("profiles")
        .select("id, username")
        .limit(100)
      creatorProfiles?.forEach((p: any) => creatorMap.set(p.id, p))
    }

    trending = (trendingItems || []).slice(0, 6).map((item: any) => ({
      ...item,
      product: productMap.get(item.product_id),
    })).filter((item: any) => item.product)

    const { data: creatorList } = await admin
      .from("profiles")
      .select("id, username, avatar_url, tier")
      .eq("role", "creator")
      .limit(6)
    profiles = creatorList || []
  } catch {
    // DB not available – show static landing page
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">QCBase</Link>
          <div className="flex items-center gap-3">
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="text-xs">Explore</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="text-xs">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Finde die besten{" "}
              <span className="text-primary">Rep-Fashion</span> Deals
            </h1>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Entdecke kuratierte Produkte von den besten Sourcing-Creatorn. Kein Spreadsheet-Chaos mehr.
            </p>

            {/* Search */}
            <form action="/explore" className="mt-8 mx-auto max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Nach Produkten suchen..."
                  className="pl-10 pr-4 h-11 text-sm"
                />
              </div>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Link href="/explore?category=Sneakers">
                <Badge variant="secondary" className="cursor-pointer px-3 py-1 text-xs hover:bg-secondary/80">Sneakers</Badge>
              </Link>
              <Link href="/explore?category=Jackets">
                <Badge variant="secondary" className="cursor-pointer px-3 py-1 text-xs hover:bg-secondary/80">Jacken</Badge>
              </Link>
              <Link href="/explore?category=Hoodies">
                <Badge variant="secondary" className="cursor-pointer px-3 py-1 text-xs hover:bg-secondary/80">Hoodies</Badge>
              </Link>
              <Link href="/explore?category=T-Shirts">
                <Badge variant="secondary" className="cursor-pointer px-3 py-1 text-xs hover:bg-secondary/80">T-Shirts</Badge>
              </Link>
              <Link href="/explore?category=Accessories">
                <Badge variant="secondary" className="cursor-pointer px-3 py-1 text-xs hover:bg-secondary/80">Accessoires</Badge>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products Grid */}
      {trending.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Trending jetzt</h2>
                <p className="mt-1 text-xs text-muted-foreground">Die beliebtesten Produkte der Community</p>
              </div>
              <Link href="/explore?sort=trending" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                Alle anzeigen <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-3">
              {trending.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/${creatorMap.get(item.creator_id)?.username || "explore"}`}
                  className="group"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <TrendingUp className="h-8 w-8 opacity-20" />
                    </div>
                  </div>
                  <div className="px-0.5 py-2">
                    <p className="line-clamp-2 text-sm font-medium leading-tight">
                      {item.custom_title || item.product?.title || "Produkt"}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {item.product?.agent_cached_price && (
                        <span className="font-mono text-xs text-muted-foreground">
                          ~{Number(item.product.agent_cached_price).toFixed(2).replace(".", ",")} €
                        </span>
                      )}
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {item.product?.platform}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Creators */}
      {profiles && profiles.length > 0 && (
        <section className="border-t border-zinc-200 py-12 dark:border-zinc-800 sm:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Beliebte Creator</h2>
              <Link href="/explore" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                Alle Creator <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {profiles.map((profile: any) => (
                <Link
                  key={profile.id}
                  href={`/${profile.username}`}
                  className="flex flex-col items-center gap-2 rounded-md border border-zinc-200 p-4 transition-colors hover:bg-muted/50 dark:border-zinc-800"
                >
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                    {profile.username?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium">@{profile.username}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      {profile.tier === "creator_plus" ? "Creator+" : profile.tier === "creator" ? "Creator" : "Free"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight">Bereit, deinen eigenen Hub zu starten?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Erstelle deinen Creator-Hub und verdiene an jedem Click-Out.
          </p>
          <div className="mt-6">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Jetzt starten <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-muted-foreground">
          QCBase – Creator Hub für Proxy-Shopping
        </div>
      </footer>
    </div>
  )
}
