import { redirect, notFound } from "next/navigation"
import { cookies } from "next/headers"
import Link from "next/link"
import { getUserBySessionToken } from "@/lib/auth/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Bookmark, Trash2, ShoppingCart } from "lucide-react"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

async function removeItem(collectionId: string, itemId: string) {
  "use server"
  const admin = createAdminClient()
  await admin.from("collection_items").delete().eq("id", itemId)
  revalidatePath(`/collections/${collectionId}`)
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const c = await cookies()
  const token = c.get("session")?.value
  if (!token) redirect("/login")

  const user = await getUserBySessionToken(token)
  if (!user) redirect("/login")

  const { id } = await params
  const admin = createAdminClient()

  const { data: collection } = await admin
    .from("user_collections")
    .select("id, name, is_public, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!collection) notFound()

  const { data: items } = await admin
    .from("collection_items")
    .select("id, product_id, added_at")
    .eq("collection_id", id)
    .order("added_at", { ascending: false })

  const productMap = new Map<string, any>()
  const imageMap = new Map<string, any[]>()

  if (items && items.length > 0) {
    const productIds = [...new Set(items.map((i: any) => i.product_id))]

    const { data: products } = await admin
      .from("products")
      .select("id, source_url, platform, title, agent_cached_price, is_oos")
      .in("id", productIds)

    products?.forEach((p: any) => productMap.set(p.id, p))

    const { data: images } = await admin
      .from("product_images")
      .select("id, product_id, url, is_qc")
      .in("product_id", productIds)

    images?.forEach((img: any) => {
      if (!imageMap.has(img.product_id)) imageMap.set(img.product_id, [])
      imageMap.get(img.product_id)!.push(img)
    })
  }

  const collectionItems = (items || []).map((item: any) => ({
    ...item,
    product: productMap.get(item.product_id) || null,
    images: imageMap.get(item.product_id) || [],
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/collections"
            className="inline-flex items-center gap-1 font-mono text-xs text-zinc-500 hover:text-zinc-300"
          >
            <ArrowLeft className="h-3 w-3" />
            BACK
          </Link>
          <Separator orientation="vertical" className="h-4 bg-zinc-700" />
          <h1 className="text-xl font-bold tracking-tight text-white">{collection.name}</h1>
          <Badge variant={collection.is_public ? "default" : "secondary"} className="text-[10px]">
            {collection.is_public ? "Public" : "Private"}
          </Badge>
        </div>
        <span className="font-mono text-xs text-zinc-500">
          {collectionItems.length} items
        </span>
      </div>

      {collectionItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 py-20 text-center">
          <Bookmark className="h-8 w-8 text-zinc-600" />
          <p className="mt-4 font-mono text-sm text-zinc-400">No items in this collection</p>
          <Link
            href="/explore"
            className="mt-2 font-mono text-xs text-zinc-500 hover:text-zinc-300"
          >
            &larr; EXPLORE PRODUCTS
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {collectionItems.map((item: any) => {
            const product = item.product
            if (!product) return null

            const images = item.images || []
            const thumbnail = images.find((img: any) => !img.is_qc)?.url || images[0]?.url

            return (
              <div key={item.id} className="group">
                <Link
                  href={product.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-zinc-800">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={product.title || "Product"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-zinc-600" />
                      </div>
                    )}
                    {product.is_oos && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="bg-white/90 px-2 py-1 font-mono text-[10px] font-semibold text-black">
                          [OOS]
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="px-0.5 py-2">
                  <p className="line-clamp-2 text-xs leading-tight text-zinc-300">
                    {product.title || "Untitled"}
                  </p>
                  {product.agent_cached_price !== null && (
                    <p className="mt-0.5 font-mono text-xs text-zinc-500">
                      &euro;{Number(product.agent_cached_price).toFixed(2).replace(".", ",")}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    {product.platform && (
                      <Badge variant="outline" className="text-[10px] font-mono py-0 h-4 border-zinc-700 text-zinc-500">
                        {product.platform}
                      </Badge>
                    )}
                    <form action={removeItem.bind(null, id, item.id)}>
                      <button
                        type="submit"
                        className="inline-flex items-center text-zinc-600 hover:text-rose-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
