import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createAdminClient } from "@/lib/supabase/admin"
import { SiteNav } from "@/components/ui/site-nav"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  let trending: any[] = []
  let profiles: any[] = []
  const productMap = new Map<string, any>()

  try {
    const admin = createAdminClient()
    const { data: items } = await admin.from("creator_items").select("id, category, custom_title, product_id, creator_id").limit(8)
    if ((items || []).length > 0) {
      const { data: products } = await admin.from("products").select("id, title, platform, agent_cached_price").limit(100)
      products?.forEach((p: any) => productMap.set(p.id, p))
    }
    trending = (items || []).slice(0, 6).map((i: any) => ({ ...i, product: productMap.get(i.product_id) })).filter((i: any) => i.product)
    const { data: p } = await admin.from("user_accounts").select("id, username, tier").eq("role", "creator").limit(6)
    profiles = p || []
  } catch {}

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">QCBase</Link>
          <div className="flex items-center gap-3">
            <SiteNav />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 py-24 dark:border-zinc-800 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200/50 via-background to-background dark:from-zinc-800/30 dark:via-zinc-950 dark:to-zinc-950" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            The Engine for{" "}
            <span className="text-primary">Proxy-Shopping</span> Creators
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Route. Scrape. Convert. — Everything your community needs to source the best products.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 font-semibold">Start your Hub</Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="lg" className="h-12 px-8">Explore Feed</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="border-b border-zinc-200 py-16 dark:border-zinc-800 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-md border border-zinc-200 p-8 dark:border-zinc-800 md:col-span-2">
              <p className="font-mono text-xs text-zinc-500">01 / AUTO-QC</p>
              <h3 className="mt-2 text-xl font-bold">Automatic Quality Control</h3>
              <p className="mt-2 text-sm text-muted-foreground">Our scrapers pull QC images directly from agent warehouses. No manual uploading needed.</p>
            </div>
            <div className="rounded-md border border-zinc-200 p-8 dark:border-zinc-800">
              <p className="font-mono text-xs text-zinc-500">02 / MULTI-AGENT</p>
              <h3 className="mt-2 text-lg font-bold">11 Agents</h3>
              <p className="mt-2 text-sm text-muted-foreground">Your community picks their favorite agent. We route the link instantly.</p>
            </div>
            <div className="rounded-md border border-zinc-200 p-8 dark:border-zinc-800">
              <p className="font-mono text-xs text-zinc-500">03 / OOS SCRUBBER</p>
              <h3 className="mt-2 text-lg font-bold">Dead Link Detection</h3>
              <p className="mt-2 text-sm text-muted-foreground">Automated checks purge out-of-stock listings before your community sees them.</p>
            </div>
            <div className="rounded-md border border-zinc-200 p-8 dark:border-zinc-800 md:col-span-2">
              <p className="font-mono text-xs text-zinc-500">04 / CUSTOM DOMAIN</p>
              <h3 className="mt-2 text-xl font-bold">Your Brand. Your Domain.</h3>
              <p className="mt-2 text-sm text-muted-foreground">Run your hub on links.yourbrand.com with full custom theming and accent colors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Teaser */}
      {trending.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-zinc-500">TRENDING NOW</p>
                <h2 className="mt-1 text-xl font-bold">What's moving right now</h2>
              </div>
              <Link href="/explore" className="font-mono text-xs text-muted-foreground hover:text-foreground">VIEW ALL →</Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-3">
              {trending.slice(0, 6).map((item: any) => (
                <Link key={item.id} href="/explore" className="group block">
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-mono text-xs text-zinc-600">{item.product?.platform?.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="px-0.5 py-2">
                    <p className="line-clamp-2 text-sm font-medium">{item.custom_title || item.product?.title}</p>
                    {item.product?.agent_cached_price && (
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        ~{Number(item.product.agent_cached_price).toFixed(2).replace(".", ",")} €
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Creators */}
      {profiles.length > 0 && (
        <section className="border-t border-zinc-200 py-16 dark:border-zinc-800 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <p className="font-mono text-xs text-zinc-500">TRUSTED BY</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              {profiles.map((p: any) => (
                <Link key={p.id} href={`/${p.username}`} className="flex items-center gap-2 rounded-md border border-zinc-200 px-4 py-2 transition-colors hover:bg-muted/50 dark:border-zinc-800">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                    {p.username?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium">@{p.username}</p>
                    <Badge variant="secondary" className="mt-0.5 text-[10px]">{p.tier === "creator_plus" ? "Creator+" : p.tier}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-zinc-200 py-20 dark:border-zinc-800">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to launch your hub?</h2>
          <p className="mt-3 text-sm text-muted-foreground">Join the platform that powers proxy-shopping creators.</p>
          <div className="mt-8">
            <Link href="/login">
              <Button size="lg" className="h-12 px-10 font-semibold">Start your Hub</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center font-mono text-[10px] text-muted-foreground">
          QCBase — The Engine for Proxy-Shopping Creators
        </div>
      </footer>
    </div>
  )
}
