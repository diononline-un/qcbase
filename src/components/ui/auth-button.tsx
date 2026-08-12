"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getSession } from "@/lib/actions/session"

export function AuthButton() {
  const [user, setUser] = useState<{ username: string | null; role: string } | null | undefined>(undefined)

  useEffect(() => {
    getSession().then(setUser)
  }, [])

  if (user === undefined) {
    return <span className="h-8 w-16 animate-pulse rounded bg-muted" />
  }

  if (!user) {
    return (
      <Link href="/login" className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90">
        Login
      </Link>
    )
  }

  return (
    <Link
      href={user.role === "creator" || user.role === "admin" ? "/analytics" : "/collections"}
      className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted dark:border-zinc-700"
    >
      Dashboard
    </Link>
  )
}
