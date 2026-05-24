import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getUserBySessionToken } from "@/lib/auth/auth"
import { AuthForm } from "@/components/auth/auth-form"

export default async function LoginPage() {
  const c = await cookies()
  const token = c.get("session")?.value
  if (token) {
    const user = await getUserBySessionToken(token)
    if (user) redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md space-y-6 rounded-md border border-zinc-800 bg-zinc-900 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">QCBase</h1>
          <p className="mt-1 font-mono text-xs text-zinc-500">TERMINAL v3.0</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
