import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getUserBySessionToken } from "@/lib/auth/auth"
import { ImportForm } from "@/components/dashboard/import-form"

export default async function ImportPage() {
  const c = await cookies()
  const token = c.get("session")?.value
  if (!token) redirect("/login")
  const user = await getUserBySessionToken(token)
  if (!user) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Import Products</h1>
        <p className="mt-1 font-mono text-xs text-zinc-500">Upload CSV or paste links to batch-import products</p>
      </div>
      <ImportForm userId={user.id} />
    </div>
  )
}
