import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface CreatorBannerProps {
  creator: {
    username: string | null
    tier: string
    avatar_url: string | null
  }
  settings: {
    banner_url: string | null
  }
  theme: {
    primaryColor?: string
    backgroundColor?: string
  }
}

export function CreatorBanner({ creator, settings, theme }: CreatorBannerProps) {
  const initials = creator.username?.slice(0, 2).toUpperCase() || "QC"
  const tierLabel = {
    free: "Free",
    creator: "Creator",
    creator_plus: "Creator+",
    reseller: "Reseller",
  }[creator.tier]

  return (
    <div className="relative">
      {settings.banner_url ? (
        <div className="h-48 w-full overflow-hidden sm:h-64">
          <img
            src={settings.banner_url}
            alt={`${creator.username}'s Banner`}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div
          className="h-48 w-full sm:h-64"
          style={{ backgroundColor: theme.primaryColor || "#6B7280" }}
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent h-24" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative -mt-12 flex items-end gap-4 pb-4">
          <Avatar className="h-20 w-20 border-4 border-background shadow-md sm:h-24 sm:w-24">
            <AvatarImage src={creator.avatar_url || undefined} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 pb-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {creator.username || "Creator"}
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {tierLabel}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
