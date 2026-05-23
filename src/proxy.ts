import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function proxy(request: NextRequest) {
  const url = request.nextUrl
  const rawHost = request.headers.get("host") || ""
  const cleanHost = rawHost.split(":")[0].toLowerCase()

  // Passthrough: static assets, API, auth, media
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/favicon.ico") ||
    url.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff2?|webp|gif)$/)
  ) {
    return NextResponse.next()
  }

  // Passthrough: known app routes
  const APP_ROUTES = ["/login", "/explore"]
  if (APP_ROUTES.includes(url.pathname)) {
    return NextResponse.next()
  }

  let creatorSlug: string | null = null

  // 1. Dev fallback: ?creator= param
  const creatorParam = url.searchParams.get("creator")
  if (creatorParam) {
    creatorSlug = creatorParam
  }

  // 2. Host-based routing: custom domain or subdomain
  if (!creatorSlug && cleanHost !== "localhost" && cleanHost !== "127.0.0.1" && !cleanHost.startsWith("192.168.")) {
    const admin = createAdminClient()

    // Try exact custom_domain match first
    const { data: customMatch } = await admin
      .from("creator_settings")
      .select("subdomain")
      .eq("custom_domain", cleanHost)
      .single()

    if (customMatch?.subdomain) {
      creatorSlug = customMatch.subdomain
    } else {
      // Try subdomain match (e.g. creator.qcbase.site)
      const parts = cleanHost.split(".")
      if (parts.length >= 3) {
        const potentialSubdomain = parts[0]
        const { data: subMatch } = await admin
          .from("creator_settings")
          .select("subdomain")
          .eq("subdomain", potentialSubdomain)
          .single()

        if (subMatch) {
          creatorSlug = potentialSubdomain
        }
      }
    }
  }

  // 3. Localhost: auto-resolve from URL path (e.g. /jzlin → creator jzlin)
  //    This avoids needing ?creator= param on localhost
  if (!creatorSlug && (cleanHost === "localhost" || cleanHost === "127.0.0.1")) {
    const pathSegments = url.pathname.split("/").filter(Boolean)
    if (pathSegments.length > 0) {
      const potentialSlug = pathSegments[0].toLowerCase()
      // Only if the path segment doesn't look like an app route
      if (!APP_ROUTES.includes(`/${potentialSlug}`)) {
        creatorSlug = potentialSlug
      }
    }
  }

  // Rewrite if we have a creator
  if (creatorSlug) {
    const newPath = url.pathname.startsWith(`/${creatorSlug}`)
      ? url.pathname.slice(creatorSlug.length + 1) || "/"
      : url.pathname

    const newUrl = new URL(`/${creatorSlug}${newPath}`, request.url)
    url.searchParams.forEach((value, key) => {
      if (key !== "creator") newUrl.searchParams.set(key, value)
    })

    const response = NextResponse.rewrite(newUrl)
    response.headers.set("x-creator-slug", creatorSlug)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
