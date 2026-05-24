"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard, Link2, Palette, Settings, CreditCard, BarChart3, LogOut,
} from "lucide-react"

const navItems = [
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/links", label: "Links", icon: Link2 },
  { href: "/theme", label: "Theme", icon: Palette },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function DashboardSidebar({ username }: { username: string }) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <aside className="flex w-56 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
        <Link href="/" className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-zinc-400" />
          <span className="text-sm font-bold tracking-tight text-white">QCBase</span>
        </Link>
      </div>

      <div className="flex-1 px-3 py-4">
        <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-wider text-zinc-600">Dashboard</p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-2 text-xs text-zinc-400 hover:text-white",
                    isActive && "bg-zinc-800/50 text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-zinc-800 p-3">
        <p className="truncate px-3 font-mono text-xs text-zinc-500">{username}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 w-full justify-start gap-2 text-xs text-zinc-500 hover:text-rose-400"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
    </aside>
  )
}
