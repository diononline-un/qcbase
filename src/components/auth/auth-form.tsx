"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, LogIn, UserPlus } from "lucide-react"

export function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"login" | "register">("login")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register"
      const body = mode === "login"
        ? { email, password }
        : { email, password, username }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Auth failed")
        setLoading(false)
        return
      }

      if (mode === "register") {
        setError("Account created! Please sign in.")
        setMode("login")
      } else {
        router.push(data.redirect || "/")
        router.refresh()
      }
    } catch {
      setError("Network error")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 rounded-md bg-zinc-800 p-0.5">
        <button
          type="button"
          onClick={() => { setMode("login"); setError(null) }}
          className={`inline-flex items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "login" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-300"
          }`}
        >
          <LogIn className="h-3 w-3" />
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode("register"); setError(null) }}
          className={`inline-flex items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "register" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-300"
          }`}
        >
          <UserPlus className="h-3 w-3" />
          Register
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs text-zinc-400">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-zinc-700 bg-zinc-800 text-sm text-white placeholder:text-zinc-500"
        />
      </div>

      {mode === "register" && (
        <div className="space-y-2">
          <Label htmlFor="username" className="text-xs text-zinc-400">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="yourname"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border-zinc-700 bg-zinc-800 text-sm text-white placeholder:text-zinc-500"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs text-zinc-400">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="border-zinc-700 bg-zinc-800 text-sm text-white placeholder:text-zinc-500"
        />
      </div>

      {error && (
        <p className={`font-mono text-xs ${error.includes("created") ? "text-emerald-400" : "text-rose-400"}`}>
          {error}
        </p>
      )}

      <Button type="submit" className="h-11 w-full font-semibold" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {mode === "login" ? "Sign In" : "Create Account"}
      </Button>

      {mode === "login" && (
        <p className="text-center font-mono text-[10px] text-zinc-600">
          Demo: creator@qcbase.site / test123
        </p>
      )}
    </form>
  )
}
