"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Link2,
  Palette,
  Settings,
  CreditCard,
  BarChart3,
  LogOut,
  ChevronLeft,
} from "lucide-react"

const navItems = [
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/links", label: "Links", icon: Link2 },
  { href: "/theme", label: "Theme", icon: Palette },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
]

interface DashboardSidebarProps {
  username: string
}

export function DashboardSidebar({ username }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold tracking-tight">QCBase</span>
        </Link>
      </div>

      <div className="flex-1 px-3 py-4">
        <p className="mb-3 px-3 text-xs font-medium text-muted-foreground">
          Dashboard
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive && "bg-secondary font-medium"
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

      <Separator />

      <div className="p-3">
        <p className="truncate px-3 text-xs text-muted-foreground">
          {username}
        </p>
        <Link href="/login">
          <Button variant="ghost" size="sm" className="mt-1 w-full justify-start gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </Link>
      </div>
    </aside>
  )
}
