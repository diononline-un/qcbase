import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function proxy(request: NextRequest) {
  const { supabase } = await createSessionlessClient(request)
  const url = request.nextUrl
  const host = request.headers.get("host") || ""

  // Auth callback passthrough
  if (url.pathname.startsWith("/auth") || url.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Static assets passthrough
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/favicon.ico") ||
    url.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff2?)$/)
  ) {
    return NextResponse.next()
  }

  // Try to resolve creator from host
  let creatorSlug: string | null = null

  // 1. Check for ?creator= param (local dev fallback)
  const creatorParam = url.searchParams.get("creator")
  if (creatorParam) {
    creatorSlug = creatorParam
  }

  // 2. Check subdomain or custom domain from host
  if (!creatorSlug && host) {
    const cleanHost = host.split(":")[0].toLowerCase()

    // Localhost with subdomain simulation via nip.io or similar
    if (cleanHost === "localhost" || cleanHost === "127.0.0.1") {
      // Fall back to ?creator= param on localhost
    } else {
      const admin = createAdminClient()

      // First try exact custom_domain match
      const { data: customMatch } = await admin
        .from("creator_settings")
        .select("creator_id, subdomain")
        .eq("custom_domain", cleanHost)
        .single()

      if (customMatch) {
        creatorSlug = customMatch.subdomain
      } else {
        // Try subdomain match (e.g. creator.qcbase.site)
        const subdomainParts = cleanHost.split(".")
        if (subdomainParts.length >= 3) {
          const potentialSubdomain = subdomainParts[0]
          const { data: subMatch } = await admin
            .from("creator_settings")
            .select("creator_id, subdomain")
            .eq("subdomain", potentialSubdomain)
            .single()

          if (subMatch) {
            creatorSlug = potentialSubdomain
          }
        }
      }
    }
  }

  // Rewrite path if we have a creator
  if (creatorSlug) {
    const newUrl = new URL(`/${creatorSlug}${url.pathname}`, request.url)
    url.searchParams.forEach((value, key) => {
      if (key !== "creator") {
        newUrl.searchParams.set(key, value)
      }
    })
    const response = NextResponse.rewrite(newUrl)
    response.headers.set("x-creator-slug", creatorSlug)
    return response
  }

  return NextResponse.next()
}

async function createSessionlessClient(request: NextRequest) {
  const { createClient } = await import("@supabase/supabase-js")
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return { supabase }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
