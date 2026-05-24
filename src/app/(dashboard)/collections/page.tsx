import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getUserBySessionToken } from "@/lib/auth/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Bookmark, Trash2 } from "lucide-react"
import { revalidatePath } from "next/cache"
import Link from "next/link"

async function createCollection(formData: FormData) {
  "use server"
  const name = formData.get("name") as string
  if (!name) return
  const c = await cookies()
  const token = c.get("session")?.value
  const user = token ? await getUserBySessionToken(token) : null
  if (!user) return
  const admin = createAdminClient()
  await admin.from("user_collections").insert({ user_id: user.id, name })
  revalidatePath("/collections")
}

async function deleteCollection(id: string) {
  "use server"
  const admin = createAdminClient()
  await admin.from("collection_items").delete().eq("collection_id", id)
  await admin.from("user_collections").delete().eq("id", id)
  revalidatePath("/collections")
}

export default async function CollectionsPage() {
  const c = await cookies()
  const token = c.get("session")?.value
  if (!token) redirect("/login")
  const user = await getUserBySessionToken(token)
  if (!user) redirect("/login")

  const admin = createAdminClient()
  const { data: collections } = await admin
    .from("user_collections")
    .select("id, name, is_public, created_at")
    .eq("user_id", user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Collections</h1>
          <p className="mt-1 font-mono text-xs text-zinc-500">Your personal product collections</p>
        </div>
        <form action={createCollection} className="flex gap-2">
          <Input name="name" placeholder="Collection name..." className="w-48 border-zinc-700 bg-zinc-800 text-sm text-white" required />
          <Button type="submit" size="sm" className="gap-1"><Plus className="h-4 w-4" />Create</Button>
        </form>
      </div>

      {(!collections || collections.length === 0) ? (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Bookmark className="h-8 w-8 text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-400">No collections yet</p>
            <p className="text-xs text-zinc-600">Create a collection to organize your finds</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col: any) => (
            <Card key={col.id} className="border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm font-medium text-white">{col.name}</span>
                  </div>
                  <form action={deleteCollection.bind(null, col.id)}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-600 hover:text-rose-400">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </form>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant={col.is_public ? "default" : "secondary"} className="text-[10px]">
                    {col.is_public ? "Public" : "Private"}
                  </Badge>
                  <span className="font-mono text-[10px] text-zinc-600">{new Date(col.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
