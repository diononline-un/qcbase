"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { CartButton } from "@/components/cart/cart-button"
import { AuthButton } from "./auth-button"

export function SiteNav() {
  return (
    <div className="flex items-center gap-3">
      <Link href="/explore" className="hidden font-mono text-xs text-muted-foreground transition-colors hover:text-foreground sm:block">
        Explore
      </Link>
      <Link href="/collections" className="text-muted-foreground transition-colors hover:text-foreground" title="Wishlist">
        <Heart className="h-5 w-5" />
      </Link>
      <CartButton />
      <AuthButton />
    </div>
  )
}
